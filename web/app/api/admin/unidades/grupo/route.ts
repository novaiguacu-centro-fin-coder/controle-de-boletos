import { NextResponse } from "next/server";
import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const form = await request.formData();
  const id = String(form.get("id") ?? "").trim();
  const groupId = String(form.get("groupId") ?? "").trim() || null;
  if (!id) return NextResponse.redirect(new URL("/admin/unidades?erro=dados", request.url), 303);
  await getD1().prepare("UPDATE units SET group_id = ? WHERE id = ?").bind(groupId, id).run();
  await audit(user.id, "CLASSIFICACAO_UNIDADE", "unit", id, { groupId });
  return NextResponse.redirect(new URL("/admin/unidades?sucesso=grupo", request.url), 303);
}
