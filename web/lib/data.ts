import "server-only";

import { getD1 } from "@/db";
import type { AppUser } from "@/lib/auth";
import { getOperatorUnit, toOperatorPayment } from "@/lib/operator";

export type SearchValues = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function getOperatorPayments(user: AppUser, search: SearchValues) {
  const authorizedUnitGroupId = getOperatorUnit(user);
  const clauses = ["unit_id IN (SELECT id FROM units WHERE group_id = ?)", "status = 'LIBERADO'"];
  const values: unknown[] = [authorizedUnitGroupId];
  const from = one(search.from);
  const to = one(search.to);
  const method = one(search.method);
  const name = one(search.name);
  const document = one(search.document).replace(/\D/g, "");
  if (from) { clauses.push("payment_date >= ?"); values.push(from); }
  if (to) { clauses.push("payment_date <= ?"); values.push(to); }
  if (method) { clauses.push("payment_method = ?"); values.push(method); }
  if (name) { clauses.push("payer_name LIKE ?"); values.push(`%${name}%`); }
  if (document) { clauses.push("REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') LIKE ?"); values.push(`%${document}%`); }
  const sort = one(search.sort) === "name" ? "payer_name COLLATE NOCASE, payment_date" : "payment_date, payer_name COLLATE NOCASE";
  const result = await getD1().prepare(`
    SELECT id, payer_name AS payerName, document, payment_date AS paymentDate,
      payment_method AS paymentMethod, amount_to_settle_cents AS amountToSettleCents
    FROM payments
    WHERE ${clauses.join(" AND ")}
    ORDER BY ${sort}
    LIMIT 2000
  `).bind(...values).all<{
    id: string; payerName: string; document: string; paymentDate: string;
    paymentMethod: string; amountToSettleCents: number;
  }>();
  return result.results.map(toOperatorPayment);
}

export async function getUnits() {
  return (await getD1().prepare("SELECT u.id, u.name, u.code, u.active, u.group_id AS groupId, g.name AS groupName FROM units u LEFT JOIN unit_groups g ON g.id = u.group_id ORDER BY u.name").all<{
    id: string; name: string; code: string; active: number; groupId: string | null; groupName: string | null;
  }>()).results;
}

export async function getUnitGroups() {
  return (await getD1().prepare("SELECT id, name, active FROM unit_groups WHERE active = 1 ORDER BY name").all<{
    id: string; name: string; active: number;
  }>()).results;
}

export async function getRules() {
  return (await getD1().prepare(`
    SELECT r.id, r.name, r.compensated_amount_cents AS compensatedAmountCents,
      r.deduction_amount_cents AS deductionAmountCents, r.payment_method AS paymentMethod,
      r.unit_id AS unitId, u.name AS unitName, r.plan, r.start_date AS startDate,
      r.end_date AS endDate, r.reason, r.active
    FROM deduction_rules r LEFT JOIN units u ON u.id = r.unit_id
    ORDER BY r.active DESC, r.compensated_amount_cents, r.name
  `).all<Record<string, string | number | null>>()).results;
}

export async function getImportBatches() {
  return (await getD1().prepare(`
    SELECT b.id, b.filename, b.imported_at AS importedAt, b.total_records AS totalRecords,
      b.valid_records AS validRecords, b.duplicate_records AS duplicateRecords,
      b.rejected_records AS rejectedRecords, b.total_amount_cents AS totalAmountCents,
      b.status, u.username
    FROM import_batches b JOIN users u ON u.id = b.imported_by
    ORDER BY b.imported_at DESC LIMIT 100
  `).all<Record<string, string | number>>()).results;
}

export async function getUsers() {
  return (await getD1().prepare(`
    SELECT u.id, u.username, u.role, u.active, COALESCE(u.unit_group_id, un.group_id) AS unitGroupId, COALESCE(ug.name, ug2.name) AS unitGroupName
    FROM users u LEFT JOIN units un ON un.id = u.unit_id
    LEFT JOIN unit_groups ug ON ug.id = u.unit_group_id
    LEFT JOIN unit_groups ug2 ON ug2.id = un.group_id
    ORDER BY u.active DESC, u.username
  `).all<Record<string, string | number | null>>()).results;
}

export async function getAuditLogs() {
  return (await getD1().prepare(`
    SELECT a.id, a.action, a.entity, a.entity_id AS entityId, a.created_at AS createdAt,
      a.metadata, COALESCE(u.username, 'sistema') AS username
    FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC LIMIT 200
  `).all<Record<string, string | null>>()).results;
}

export async function getAdminPayments(search: SearchValues) {
  const clauses = ["1 = 1"];
  const values: unknown[] = [];
  const from = one(search.from);
  const to = one(search.to);
  const unit = one(search.unit);
  const method = one(search.method);
  const status = one(search.status);
  if (from) { clauses.push("p.payment_date >= ?"); values.push(from); }
  if (to) { clauses.push("p.payment_date <= ?"); values.push(to); }
  if (unit) { clauses.push("p.unit_id = ?"); values.push(unit); }
  if (method) { clauses.push("p.payment_method = ?"); values.push(method); }
  if (status) { clauses.push("p.status = ?"); values.push(status); }
  return (await getD1().prepare(`
    SELECT p.id, p.payment_date AS paymentDate, COALESCE(u.name, 'Não identificada') AS unitName,
      p.payer_name AS payerName, p.document, p.payment_method AS paymentMethod,
      p.original_amount_cents AS originalAmountCents, p.deduction_amount_cents AS deductionAmountCents,
      p.amount_to_settle_cents AS amountToSettleCents, r.name AS ruleName,
      p.status, p.import_batch_id AS importBatchId
    FROM payments p LEFT JOIN units u ON u.id = p.unit_id LEFT JOIN deduction_rules r ON r.id = p.rule_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY p.payment_date DESC, p.created_at DESC LIMIT 2000
  `).bind(...values).all<Record<string, string | number | null>>()).results;
}

export async function getDashboardMetrics() {
  return await getD1().prepare(`
    SELECT COUNT(*) AS importedToday,
      COALESCE(SUM(original_amount_cents), 0) AS originalTotalCents,
      COALESCE(SUM(amount_to_settle_cents), 0) AS settleTotalCents,
      COALESCE(SUM(deduction_amount_cents), 0) AS deductionTotalCents,
      SUM(CASE WHEN status = 'DUPLICADO' THEN 1 ELSE 0 END) AS duplicateCount,
      SUM(CASE WHEN status = 'EXCECAO' THEN 1 ELSE 0 END) AS exceptionCount
    FROM payments
    WHERE date(created_at, '-3 hours') = date('now', '-3 hours')
  `).first<Record<string, number>>();
}
