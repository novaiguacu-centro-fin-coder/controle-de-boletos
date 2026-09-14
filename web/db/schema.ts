import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

export const unitGroups = sqliteTable("unit_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(now),
});

export const units = sqliteTable("units", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  groupId: text("group_id").references(() => unitGroups.id),
  createdAt: text("created_at").notNull().default(now),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["ADMIN", "OPERATOR"] }).notNull(),
  unitId: text("unit_id").references(() => units.id),
  unitGroupId: text("unit_group_id").references(() => unitGroups.id),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(now),
  updatedAt: text("updated_at").notNull().default(now),
}, (table) => [index("idx_users_unit_id").on(table.unitId)]);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(now),
}, (table) => [index("idx_sessions_user_expires").on(table.userId, table.expiresAt)]);

export const deductionRules = sqliteTable("deduction_rules", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  compensatedAmountCents: integer("compensated_amount_cents").notNull(),
  deductionAmountCents: integer("deduction_amount_cents").notNull(),
  paymentMethod: text("payment_method"),
  unitId: text("unit_id").references(() => units.id),
  plan: text("plan"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  reason: text("reason").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(now),
  updatedAt: text("updated_at").notNull().default(now),
}, (table) => [
  index("idx_rules_lookup").on(table.compensatedAmountCents, table.active, table.startDate),
  index("idx_rules_unit_id").on(table.unitId),
]);

export const importBatches = sqliteTable("import_batches", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  importedBy: text("imported_by").notNull().references(() => users.id),
  importedAt: text("imported_at").notNull().default(now),
  totalRecords: integer("total_records").notNull().default(0),
  validRecords: integer("valid_records").notNull().default(0),
  duplicateRecords: integer("duplicate_records").notNull().default(0),
  rejectedRecords: integer("rejected_records").notNull().default(0),
  totalAmountCents: integer("total_amount_cents").notNull().default(0),
  status: text("status").notNull(),
  sourceHeaders: text("source_headers").notNull().default("[]"),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  bankTransactionId: text("bank_transaction_id"),
  duplicateKey: text("duplicate_key").notNull(),
  payerName: text("payer_name").notNull(),
  document: text("document").notNull(),
  paymentDate: text("payment_date").notNull(),
  compensationDate: text("compensation_date"),
  paymentMethod: text("payment_method").notNull(),
  plan: text("plan"),
  originalAmountCents: integer("original_amount_cents").notNull(),
  deductionAmountCents: integer("deduction_amount_cents").notNull().default(0),
  amountToSettleCents: integer("amount_to_settle_cents").notNull(),
  unitId: text("unit_id").references(() => units.id),
  ruleId: text("rule_id").references(() => deductionRules.id),
  importBatchId: text("import_batch_id").notNull().references(() => importBatches.id),
  sourceFilename: text("source_filename").notNull(),
  sourceValues: text("source_values").notNull().default("[]"),
  status: text("status").notNull(),
  rejectionReason: text("rejection_reason"),
  createdAt: text("created_at").notNull().default(now),
  updatedAt: text("updated_at").notNull().default(now),
}, (table) => [
  index("idx_payments_bank_transaction").on(table.bankTransactionId),
  index("idx_payments_duplicate_key").on(table.duplicateKey),
  index("idx_payments_unit_date_status").on(table.unitId, table.paymentDate, table.status),
  index("idx_payments_unit_status_date").on(table.unitId, table.status, table.paymentDate),
  index("idx_payments_batch_id").on(table.importBatchId),
]);

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(now),
}, (table) => [index("idx_audit_created_at").on(table.createdAt)]);
