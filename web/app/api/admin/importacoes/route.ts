import { NextResponse } from "next/server";

import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";
import { buildDuplicateKey } from "@/lib/duplicates";
import { normalizeUnitReference, parseImportFile } from "@/lib/importer";
import { applyDeductionRules, type RuleCandidate } from "@/lib/rules";

type UnitRow = { id: string; name: string; code: string };
type Database = ReturnType<typeof getD1>;

const MAX_IMPORT_FILE_SIZE = 4 * 1024 * 1024;
const MAX_IMPORT_RECORDS = 100_000;
const LOOKUP_CHUNK_SIZE = 500;

async function loadExistingValues(database: Database, column: "bank_transaction_id" | "duplicate_key", values: string[]) {
  const existing = new Set<string>();
  const uniqueValues = [...new Set(values.filter(Boolean))];
  for (let index = 0; index < uniqueValues.length; index += LOOKUP_CHUNK_SIZE) {
    const chunk = uniqueValues.slice(index, index + LOOKUP_CHUNK_SIZE);
    const placeholders = chunk.map(() => "?").join(",");
    const rows = (await database.prepare(`SELECT ${column} AS value FROM payments WHERE ${column} IN (${placeholders})`)
      .bind(...chunk).all<{ value: string }>()).results;
    for (const row of rows) existing.add(row.value);
  }
  return existing;
}

export async function POST(request: Request) {
  let batchId: string | null = null;
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_IMPORT_FILE_SIZE || !/\.(csv|xlsx)$/i.test(file.name)) {
      return NextResponse.redirect(new URL("/admin/importacoes?erro=arquivo", request.url), 303);
    }
    const db = getD1();
    const parsed = parseImportFile(file.name, new Uint8Array(await file.arrayBuffer()));
    const records = parsed.records;
    if (records.length > MAX_IMPORT_RECORDS) throw new Error("O arquivo ultrapassa o limite de 100.000 registros por lote.");
    batchId = crypto.randomUUID();
    await db.prepare("INSERT INTO import_batches (id, filename, imported_by, status, source_headers) VALUES (?, ?, ?, 'PROCESSANDO', ?)")
      .bind(batchId, file.name, user.id, JSON.stringify(parsed.sourceHeaders)).run();

    const units = (await db.prepare("SELECT id, name, code FROM units WHERE active = 1").all<UnitRow>()).results;
    const unitMap = new Map<string, string>();
    for (const unit of units) {
      unitMap.set(normalizeUnitReference(unit.name), unit.id);
      unitMap.set(normalizeUnitReference(unit.code), unit.id);
    }
    const rules = (await db.prepare(`SELECT id, name, compensated_amount_cents AS compensatedAmountCents,
      deduction_amount_cents AS deductionAmountCents, payment_method AS paymentMethod, unit_id AS unitId,
      plan, start_date AS startDate, end_date AS endDate, active FROM deduction_rules WHERE active = 1
      ORDER BY CASE WHEN unit_id IS NULL THEN 1 ELSE 0 END, CASE WHEN payment_method IS NULL THEN 1 ELSE 0 END, created_at`)
      .all<RuleCandidate>()).results;
    const preparedRecords = await Promise.all(records.map(async (record) => {
      const unitId = unitMap.get(normalizeUnitReference(record.unitReference)) ?? null;
      const errors: string[] = [];
      if (!record.payerName) errors.push("Nome não informado");
      if (!record.document) errors.push("Documento não informado");
      if (!record.paymentDate) errors.push("Data de pagamento inválida");
      if (record.originalAmountCents === null || record.originalAmountCents < 0) errors.push("Valor inválido");
      if (!unitId) errors.push("Unidade não identificada");
      if (record.paymentMethod === "NAO_INFORMADO") errors.push("Forma de pagamento não informada");
      const safeDate = record.paymentDate ?? "1970-01-01";
      const safeAmount = record.originalAmountCents ?? 0;
      const duplicateKey = await buildDuplicateKey({ bankTransactionId: record.bankTransactionId, unitId, document: record.document, originalAmountCents: safeAmount, paymentDate: safeDate });
      const applied = applyDeductionRules({ originalAmountCents: safeAmount, paymentMethod: record.paymentMethod, unitId, plan: record.plan, paymentDate: safeDate }, rules);
      return { record, unitId, errors, safeDate, safeAmount, duplicateKey, applied };
    }));
    const [bankIds, duplicateKeys] = await Promise.all([
      loadExistingValues(db, "bank_transaction_id", preparedRecords.map(({ record }) => record.bankTransactionId ?? "")),
      loadExistingValues(db, "duplicate_key", preparedRecords.map(({ duplicateKey }) => duplicateKey)),
    ]);

    let valid = 0;
    let duplicated = 0;
    let rejected = 0;
    let totalAmountCents = 0;
    const statements: ReturnType<typeof db.prepare>[] = [];
    for (const { record, unitId, errors, safeDate, safeAmount, duplicateKey, applied } of preparedRecords) {
      const isDuplicate = record.bankTransactionId ? bankIds.has(record.bankTransactionId) : duplicateKeys.has(duplicateKey);
      let status = "VALIDADO";
      if (errors.length) { status = "EXCECAO"; rejected += 1; }
      else if (isDuplicate) { status = "DUPLICADO"; duplicated += 1; }
      else valid += 1;
      if (record.bankTransactionId) bankIds.add(record.bankTransactionId);
      duplicateKeys.add(duplicateKey);
      totalAmountCents += safeAmount;
      statements.push(db.prepare(`INSERT INTO payments
        (id, bank_transaction_id, duplicate_key, payer_name, document, payment_date, compensation_date,
         payment_method, plan, original_amount_cents, deduction_amount_cents, amount_to_settle_cents,
         unit_id, rule_id, import_batch_id, source_filename, source_values, status, rejection_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), record.bankTransactionId, duplicateKey, record.payerName || "Não informado", record.document,
          safeDate, record.compensationDate, record.paymentMethod, record.plan, safeAmount, applied.deductionAmountCents,
          applied.amountToSettleCents, unitId, applied.ruleId, batchId, file.name, JSON.stringify(record.sourceValues), status, errors.join("; ") || null));
    }
    for (let index = 0; index < statements.length; index += 75) await db.batch(statements.slice(index, index + 75));
    const finalStatus = rejected || duplicated ? "CONCLUIDO_COM_ALERTAS" : "CONCLUIDO";
    await db.prepare(`UPDATE import_batches SET total_records = ?, valid_records = ?, duplicate_records = ?,
      rejected_records = ?, total_amount_cents = ?, status = ? WHERE id = ?`)
      .bind(records.length, valid, duplicated, rejected, totalAmountCents, finalStatus, batchId).run();
    await audit(user.id, "IMPORTACAO", "import_batch", batchId, { filename: file.name, records: records.length, valid, duplicated, rejected });
    return NextResponse.redirect(new URL(`/admin/importacoes?lote=${batchId}`, request.url), 303);
  } catch {
    if (batchId) await getD1().prepare("UPDATE import_batches SET status = 'FALHA' WHERE id = ?").bind(batchId).run().catch(() => undefined);
    return NextResponse.redirect(new URL("/admin/importacoes?erro=processamento", request.url), 303);
  }
}
