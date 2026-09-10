import { NextResponse } from "next/server";

import { audit, getCurrentUser } from "@/lib/auth";
import { getAdminPayments } from "@/lib/data";
import { formatDateBR } from "@/lib/money";
import { createXlsx } from "@/lib/xlsx-export";

const headers = ["Data", "Unidade", "Nome", "Documento", "Forma de pagamento", "Valor compensado", "Dedução", "Valor a baixar", "Regra", "Status"];

function safeCsvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const url = new URL(request.url);
  const search = Object.fromEntries(url.searchParams.entries());
  const format = search.format === "csv" ? "csv" : "xlsx";
  delete search.format;
  const payments = await getAdminPayments(search);
  const rows = payments.map((payment) => [
    formatDateBR(String(payment.paymentDate)), String(payment.unitName), String(payment.payerName), String(payment.document),
    String(payment.paymentMethod), Number(payment.originalAmountCents) / 100, Number(payment.deductionAmountCents) / 100,
    Number(payment.amountToSettleCents) / 100, String(payment.ruleName ?? ""), String(payment.status),
  ]);
  await audit(user.id, "EXPORTACAO", "payments", null, { format, filters: search, records: rows.length });
  if (format === "csv") {
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(safeCsvCell).join(";")).join("\r\n");
    return new NextResponse(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="pagamentos.csv"` } });
  }
  const workbook = createXlsx(headers, rows);
  const body = workbook.buffer.slice(workbook.byteOffset, workbook.byteOffset + workbook.byteLength) as ArrayBuffer;
  return new NextResponse(body, { headers: {
    "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition": `attachment; filename="pagamentos.xlsx"`,
  } });
}
