import { NextResponse } from "next/server";
import { getD1 } from "@/db";
import { assertSameOrigin, audit, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const form = await request.formData();
  const batchId = String(form.get("batchId") ?? "");
  if (!batchId) return NextResponse.redirect(new URL("/admin/importacoes?erro=lote", request.url), 303);
  const result = await getD1().prepare("UPDATE payments SET status = 'LIBERADO', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE import_batch_id = ? AND status = 'VALIDADO'").bind(batchId).run();
  await audit(user.id, "LIBERACAO_LOTE", "import_batch", batchId, { changed: result.meta.changes });
  return NextResponse.redirect(new URL(`/admin/importacoes?liberado=${batchId}`, request.url), 303);
}
