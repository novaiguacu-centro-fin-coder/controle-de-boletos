import { NextResponse } from "next/server";
import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const form = await request.formData();
  const id = String(form.get("id") ?? "").trim();
  const unitGroupId = String(form.get("unitGroupId") ?? "").trim() || null;
  if (!id) return NextResponse.redirect(new URL("/admin/usuarios?erro=dados", request.url), 303);
  await getD1().prepare("UPDATE users SET unit_group_id = ?, unit_id = NULL, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now')) WHERE id = ?").bind(unitGroupId, id).run();
  await audit(admin.id, "ALTERACAO_UNIDADE_USUARIO", "user", id, { unitGroupId });
  return NextResponse.redirect(new URL("/admin/usuarios?sucesso=unidade", request.url), 303);
}
