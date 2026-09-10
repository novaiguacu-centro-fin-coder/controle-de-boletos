import { NextResponse } from "next/server";

import { getD1 } from "@/db";
import { assertSameOrigin, audit, SESSION_COOKIE } from "@/lib/auth";
import { createSessionToken, sha256, verifyPassword } from "@/lib/security";

type LoginUser = { id: string; passwordHash: string; role: "ADMIN" | "OPERATOR"; unitGroupId: string | null };

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const form = await request.formData();
    const username = String(form.get("username") ?? "").trim().toLocaleLowerCase("pt-BR");
    const password = String(form.get("password") ?? "");
    const user = await getD1().prepare(`SELECT u.id, u.password_hash AS passwordHash, u.role, COALESCE(u.unit_group_id, un.group_id) AS unitGroupId FROM users u LEFT JOIN units un ON un.id = u.unit_id WHERE u.username = ? AND u.active = 1 LIMIT 1`)
      .bind(username).first<LoginUser>();
    if (!user || !(await verifyPassword(password, user.passwordHash)) || (user.role === "OPERATOR" && !user.unitGroupId)) {
      return NextResponse.redirect(new URL("/?erro=credenciais", request.url), 303);
    }
    const token = createSessionToken();
    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000);
    await getD1().prepare("INSERT INTO sessions (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)")
      .bind(crypto.randomUUID(), await sha256(token), user.id, expires.toISOString()).run();
    await audit(user.id, "LOGIN", "session");
    const response = NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/pagamentos", request.url), 303);
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/", expires });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?erro=processamento", request.url), 303);
  }
}
