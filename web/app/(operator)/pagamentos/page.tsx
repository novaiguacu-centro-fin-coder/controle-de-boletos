import { Search } from "lucide-react";
import { OperatorWebMcp } from "@/components/operator-webmcp";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { getOperatorPaymentPage, type SearchValues } from "@/lib/data";
import { formatBRL, formatDateBR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const user = await requireUser();
  const search = await searchParams;
  const { payments, summary, page, totalPages } = await getOperatorPaymentPage(user, search);
  const query = new URLSearchParams(Object.entries(search).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams(query);
    params.set("page", String(targetPage));
    return `?${params}`;
  };
  return <div className="space-y-6 p-4 md:p-7"><OperatorWebMcp />
    <PageTitle title="Pagamentos para baixa" description={`Unidade: ${user.unitName}`} actions={<Button asChild><a href={`/relatorio?${query}`}>Imprimir relatório</a></Button>} />
    <form className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-6">
      <div className="space-y-2"><Label htmlFor="from">Data inicial</Label><Input id="from" name="from" type="date" defaultValue={String(search.from ?? "")} /></div>
      <div className="space-y-2"><Label htmlFor="to">Data final</Label><Input id="to" name="to" type="date" defaultValue={String(search.to ?? "")} /></div>
      <div className="space-y-2"><Label htmlFor="method">Forma</Label><NativeSelect id="method" name="method" defaultValue={String(search.method ?? "")} className="w-full"><NativeSelectOption value="">Todas</NativeSelectOption><NativeSelectOption value="BOLETO">Boleto</NativeSelectOption><NativeSelectOption value="PIX">PIX</NativeSelectOption><NativeSelectOption value="CARTAO">Cartão</NativeSelectOption></NativeSelect></div>
      <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" name="name" defaultValue={String(search.name ?? "")} /></div>
      <div className="space-y-2"><Label htmlFor="document">Documento</Label><Input id="document" name="document" defaultValue={String(search.document ?? "")} /></div>
      <input type="hidden" name="sort" value={String(search.sort ?? "date")} />
      <div className="flex items-end gap-2"><Button type="submit"><Search />Pesquisar</Button><Button variant="ghost" asChild><a href="/pagamentos">Limpar filtros</a></Button></div>
    </form>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3"><div><p className="text-sm text-muted-foreground">{summary.totalCount.toLocaleString("pt-BR")} pagamento(s) selecionado(s)</p><p className="text-lg font-semibold text-primary">Total selecionado: {formatBRL(summary.totalAmountToSettleCents)}</p></div><div className="flex gap-3 text-sm text-muted-foreground"><a className="hover:text-foreground hover:underline" href={`?${new URLSearchParams({ ...Object.fromEntries(query), sort: "date", page: "1" })}`}>Ordenar por data</a><a className="hover:text-foreground hover:underline" href={`?${new URLSearchParams({ ...Object.fromEntries(query), sort: "name", page: "1" })}`}>Ordenar por nome</a></div></div>
    <div className="rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Nome</TableHead><TableHead>Documento</TableHead><TableHead>Forma de pagamento</TableHead><TableHead className="text-right">Valor a baixar</TableHead></TableRow></TableHeader><TableBody>
      {payments.map((payment) => <TableRow key={payment.id}><TableCell>{formatDateBR(payment.paymentDate)}</TableCell><TableCell className="font-medium">{payment.payerName}</TableCell><TableCell>{payment.document}</TableCell><TableCell>{payment.paymentMethod}</TableCell><TableCell className="text-right text-base font-semibold text-primary">{formatBRL(payment.amountToSettleCents)}</TableCell></TableRow>)}
      {!payments.length ? <TableRow><TableCell colSpan={5} className="h-36 text-center text-muted-foreground">Nenhum pagamento liberado encontrado para este período.</TableCell></TableRow> : null}
    </TableBody></Table></div>
    {totalPages > 1 ? <nav className="flex items-center justify-between gap-3" aria-label="Paginação dos pagamentos"><p className="text-sm text-muted-foreground">Página {page.toLocaleString("pt-BR")} de {totalPages.toLocaleString("pt-BR")}</p><div className="flex gap-2">{page > 1 ? <Button variant="outline" asChild><a href={pageHref(page - 1)}>Anterior</a></Button> : <Button variant="outline" disabled>Anterior</Button>}{page < totalPages ? <Button variant="outline" asChild><a href={pageHref(page + 1)}>Próxima</a></Button> : <Button variant="outline" disabled>Próxima</Button>}</div></nav> : null}
  </div>;
}
