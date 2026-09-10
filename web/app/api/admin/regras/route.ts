import { NextResponse } from "next/server";
import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";
import { parseMoneyToCents } from "@/lib/money";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const amount = parseMoneyToCents(String(form.get("amount") ?? ""));
  const deduction = parseMoneyToCents(String(form.get("deduction") ?? ""));
  const method = String(form.get("method") ?? "").trim() || null;
  const unitId = String(form.get("unitId") ?? "").trim() || null;
  const plan = String(form.get("plan") ?? "").trim() || null;
  const startDate = String(form.get("startDate") ?? "");
  const endDate = String(form.get("endDate") ?? "").trim() || null;
  const reason = String(form.get("reason") ?? "").trim();
  if (!name || amount === null || amount <= 0 || deduction === null || deduction < 0 || deduction > amount || !startDate || !reason) {
    return NextResponse.redirect(new URL("/admin/regras?erro=dados", request.url), 303);
  }
  const id = crypto.randomUUID();
  await getD1().prepare(`INSERT INTO deduction_rules
    (id, name, compensated_amount_cents, deduction_amount_cents, payment_method, unit_id, plan, start_date, end_date, reason, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`)
    .bind(id, name, amount, deduction, method, unitId, plan, startDate, endDate, reason).run();
  await audit(user.id, "CRIACAO", "deduction_rule", id, { amount, deduction, method, unitId, startDate, endDate });
  return NextResponse.redirect(new URL("/admin/regras?sucesso=1", request.url), 303);
}
