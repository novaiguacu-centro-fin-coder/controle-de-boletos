import { PrintButton } from "@/components/print-button";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { getOperatorPayments, getOperatorPaymentSummary, type SearchValues } from "@/lib/data";
import { formatBRL, formatDateBR } from "@/lib/money";
import { groupPaymentsByDay } from "@/lib/operator";

export const dynamic = "force-dynamic";

export default async function ReportPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const user = await requireUser();
  const search = await searchParams;
  const [payments, summary] = await Promise.all([
    getOperatorPayments(user, search),
    getOperatorPaymentSummary(user, search),
  ]);
  const groups = groupPaymentsByDay(payments);
  const period = search.from || search.to ? `${search.from ? formatDateBR(String(search.from)) : "início"} a ${search.to ? formatDateBR(String(search.to)) : "hoje"}` : "Todos os pagamentos liberados";
  return <div className="mx-auto max-w-6xl space-y-7 p-4 md:p-7 print:max-w-none print:p-0">
    <PageTitle title="Relatório de pagamentos para baixa" description={`Unidade: ${user.unitName} • Período: ${period}`} actions={<><Button variant="outline" asChild><a href="/pagamentos">Voltar</a></Button><PrintButton /></>} />
    {groups.map((group) => <section key={group.date} className="break-inside-avoid rounded-xl border bg-card print:mb-8 print:border-0">
      <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-4 print:px-0"><h2 className="text-lg font-semibold">{formatDateBR(group.date)}</h2><p className="text-sm text-muted-foreground">{group.payments.length} pagamento(s)</p></div>
      <Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Documento</TableHead><TableHead>Forma de pagamento</TableHead><TableHead className="text-right">Valor a baixar</TableHead></TableRow></TableHeader><TableBody>{group.payments.map((payment) => <TableRow key={payment.id}><TableCell className="font-medium">{payment.payerName}</TableCell><TableCell>{payment.document}</TableCell><TableCell>{payment.paymentMethod}</TableCell><TableCell className="text-right font-semibold">{formatBRL(payment.amountToSettleCents)}</TableCell></TableRow>)}</TableBody></Table>
      <div className="flex justify-end gap-8 border-t px-5 py-4 text-sm print:px-0"><p>Quantidade: <strong>{group.payments.length}</strong></p><p>Total do dia: <strong>{formatBRL(group.subtotalCents)}</strong></p></div>
    </section>)}
    {!groups.length ? <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">Nenhum pagamento encontrado.</div> : null}
    {summary.totalCount > payments.length ? <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 print:hidden">A impressão lista os primeiros 2.000 pagamentos. Refine o período para imprimir todos; o resumo abaixo considera toda a seleção.</p> : null}
    <section className="ml-auto max-w-xl rounded-xl bg-[#0b2f4a] p-6 text-white print:border print:border-black print:bg-white print:text-black"><h2 className="text-lg font-semibold">Resumo do período</h2><div className="mt-4 grid grid-cols-2 gap-6"><div><p className="text-sm opacity-70">Quantidade de pagamentos</p><p className="mt-1 text-2xl font-semibold">{summary.totalCount.toLocaleString("pt-BR")}</p></div><div><p className="text-sm opacity-70">Total a baixar</p><p className="mt-1 text-2xl font-semibold">{formatBRL(summary.totalAmountToSettleCents)}</p></div></div></section>
  </div>;
}
