import { NextResponse } from "next/server";

import { getD1 } from "@/db";
import { assertSameOrigin, SESSION_COOKIE } from "@/lib/auth";
import { createSessionToken, hashPassword, sha256 } from "@/lib/security";

const initialUnits = [
  ["unit-129", "Odontologia GBG", "129"],
  ["unit-130", "Odonto Company 2016", "130"],
  ["unit-131", "J&F Odontologia 2017.2", "131"],
  ["unit-132", "J&F Odontologia 2017", "132"],
  ["unit-133", "J&F Odontologia 2020", "133"],
] as const;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const db = getD1();
    const existing = await db.prepare("SELECT COUNT(*) AS total FROM users").first<{ total: number }>();
    if (Number(existing?.total ?? 0) > 0) return NextResponse.redirect(new URL("/", request.url), 303);
    const form = await request.formData();
    const username = String(form.get("username") ?? "").trim().toLocaleLowerCase("pt-BR");
    const password = String(form.get("password") ?? "");
    if (username.length < 2 || password.length < 4) return NextResponse.redirect(new URL("/configuracao-inicial?erro=dados", request.url), 303);

    const userId = crypto.randomUUID();
    const statements = initialUnits.map(([id, name, code]) => db.prepare("INSERT INTO units (id, name, code, active) VALUES (?, ?, ?, 1)").bind(id, name, code));
    statements.push(
      db.prepare(`INSERT INTO deduction_rules
        (id, name, compensated_amount_cents, deduction_amount_cents, payment_method, unit_id, plan, start_date, end_date, reason, active)
        VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, NULL, ?, 1)`)
        .bind("rule-global-6000", "Deduzir R$ 30 de R$ 60", 6000, 3000, "2000-01-01", "Divisão operacional confirmada para todas as formas"),
      db.prepare(`INSERT INTO deduction_rules
        (id, name, compensated_amount_cents, deduction_amount_cents, payment_method, unit_id, plan, start_date, end_date, reason, active)
        VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, NULL, ?, 1)`)
        .bind("rule-global-14900", "Deduzir R$ 30 de R$ 149", 14900, 3000, "2000-01-01", "Divisão operacional confirmada para todas as formas"),
      db.prepare("INSERT INTO users (id, username, password_hash, role, unit_id, active) VALUES (?, ?, ?, 'ADMIN', NULL, 1)").bind(userId, username, await hashPassword(password)),
      db.prepare("INSERT INTO audit_logs (id, user_id, action, entity, entity_id, metadata) VALUES (?, ?, 'CONFIGURACAO_INICIAL', 'system', NULL, '{}')").bind(crypto.randomUUID(), userId),
    );
    await db.batch(statements);

    const token = createSessionToken();
    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000);
    await db.prepare("INSERT INTO sessions (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)")
      .bind(crypto.randomUUID(), await sha256(token), userId, expires.toISOString()).run();
    const response = NextResponse.redirect(new URL("/admin", request.url), 303);
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/", expires });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/configuracao-inicial?erro=processamento", request.url), 303);
  }
}
