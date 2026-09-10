import { NextResponse } from "next/server";
import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  await getD1().prepare("UPDATE units SET active = CASE active WHEN 1 THEN 0 ELSE 1 END WHERE id = ?").bind(id).run();
  await audit(user.id, "ALTERACAO_STATUS", "unit", id);
  return NextResponse.redirect(new URL("/admin/unidades", request.url), 303);
}
