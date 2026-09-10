import { NextResponse } from "next/server";
import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const code = String(form.get("code") ?? "").trim().toLocaleUpperCase("pt-BR");
  const groupId = String(form.get("groupId") ?? "").trim() || null;
  if (!name || !code) return NextResponse.redirect(new URL("/admin/unidades?erro=dados", request.url), 303);
  const id = crypto.randomUUID();
  try {
    await getD1().prepare("INSERT INTO units (id, name, code, group_id, active) VALUES (?, ?, ?, ?, 1)").bind(id, name, code, groupId).run();
    await audit(user.id, "CRIACAO", "unit", id, { code });
    return NextResponse.redirect(new URL("/admin/unidades?sucesso=1", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/unidades?erro=duplicado", request.url), 303);
  }
}
