import { NextResponse } from "next/server";
import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/security";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim().toLocaleLowerCase("pt-BR");
  const password = String(form.get("password") ?? "");
  const role = String(form.get("role") ?? "OPERATOR") === "ADMIN" ? "ADMIN" : "OPERATOR";
  const unitGroupId = String(form.get("unitGroupId") ?? "").trim() || null;
  if (username.length < 2 || password.length < 12 || (role === "OPERATOR" && !unitGroupId)) {
    return NextResponse.redirect(new URL("/admin/usuarios?erro=dados", request.url), 303);
  }
  const id = crypto.randomUUID();
  try {
    await getD1().prepare("INSERT INTO users (id, username, password_hash, role, unit_group_id, active) VALUES (?, ?, ?, ?, ?, 1)")
      .bind(id, username, await hashPassword(password), role, unitGroupId).run();
    await audit(user.id, "CRIACAO", "user", id, { username, role, unitGroupId });
    return NextResponse.redirect(new URL("/admin/usuarios?sucesso=1", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/usuarios?erro=duplicado", request.url), 303);
  }
}
