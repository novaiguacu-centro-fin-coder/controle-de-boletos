import { NextResponse } from "next/server";
import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/security";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const password = String(form.get("password") ?? "");
  if (password.length < 12) return NextResponse.redirect(new URL("/admin/usuarios?erro=senha", request.url), 303);
  await getD1().prepare("UPDATE users SET password_hash = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?").bind(await hashPassword(password), id).run();
  await getD1().prepare("DELETE FROM sessions WHERE user_id = ? AND user_id <> ?").bind(id, user.id).run();
  await audit(user.id, "REDEFINICAO_SENHA", "user", id);
  return NextResponse.redirect(new URL("/admin/usuarios?senha=1", request.url), 303);
}
