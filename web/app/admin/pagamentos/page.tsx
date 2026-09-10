import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { getAdminPayments, getUnits, type SearchValues } from "@/lib/data";
import { formatBRL, formatDateBR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminPayments({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const search = await searchParams;
  const [payments, units] = await Promise.all([getAdminPayments(search), getUnits()]);
  return <div className="space-y-6 p-4 md:p-7">
    <PageTitle title="Pagamentos" description={`${payments.length.toLocaleString("pt-BR")} registro(s) no filtro atual.`} actions={<><Button variant="outline" asChild><a href={`/api/admin/export?format=csv&${new URLSearchParams(search as Record<string, string>)}`}>Exportar CSV</a></Button><Button asChild><a href={`/api/admin/export?format=xlsx&${new URLSearchParams(search as Record<string, string>)}`}>Exportar XLSX</a></Button></>} />
    <form className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-6">
      <div className="space-y-2"><Label htmlFor="from">Data inicial</Label><Input id="from" name="from" type="date" defaultValue={String(search.from ?? "")} /></div>
      <div className="space-y-2"><Label htmlFor="to">Data final</Label><Input id="to" name="to" type="date" defaultValue={String(search.to ?? "")} /></div>
      <div className="space-y-2"><Label htmlFor="unit">Unidade</Label><NativeSelect id="unit" name="unit" defaultValue={String(search.unit ?? "")} className="w-full"><NativeSelectOption value="">Todas</NativeSelectOption>{units.map((unit) => <NativeSelectOption key={unit.id} value={unit.id}>{unit.name}</NativeSelectOption>)}</NativeSelect></div>
      <div className="space-y-2"><Label htmlFor="method">Forma</Label><NativeSelect id="method" name="method" defaultValue={String(search.method ?? "")} className="w-full"><NativeSelectOption value="">Todas</NativeSelectOption><NativeSelectOption value="BOLETO">Boleto</NativeSelectOption><NativeSelectOption value="PIX">PIX</NativeSelectOption><NativeSelectOption value="CARTAO">Cartão</NativeSelectOption></NativeSelect></div>
      <div className="space-y-2"><Label htmlFor="status">Status</Label><NativeSelect id="status" name="status" defaultValue={String(search.status ?? "")} className="w-full"><NativeSelectOption value="">Todos</NativeSelectOption>{["VALIDADO","LIBERADO","DUPLICADO","EXCECAO","BAIXADO"].map((status) => <NativeSelectOption key={status} value={status}>{status}</NativeSelectOption>)}</NativeSelect></div>
      <div className="flex items-end gap-2"><Button type="submit">Pesquisar</Button><Button variant="ghost" asChild><a href="/admin/pagamentos">Limpar</a></Button></div>
    </form>
    <div className="rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Unidade</TableHead><TableHead>Nome / Documento</TableHead><TableHead>Forma</TableHead><TableHead className="text-right">Compensado</TableHead><TableHead className="text-right">Dedução</TableHead><TableHead className="text-right">A baixar</TableHead><TableHead>Regra</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
      {payments.map((payment) => <TableRow key={String(payment.id)}><TableCell>{formatDateBR(String(payment.paymentDate))}</TableCell><TableCell>{String(payment.unitName)}</TableCell><TableCell><p className="font-medium">{String(payment.payerName)}</p><p className="text-xs text-muted-foreground">{String(payment.document)}</p></TableCell><TableCell>{String(payment.paymentMethod)}</TableCell><TableCell className="text-right">{formatBRL(Number(payment.originalAmountCents))}</TableCell><TableCell className="text-right">{formatBRL(Number(payment.deductionAmountCents))}</TableCell><TableCell className="text-right font-semibold">{formatBRL(Number(payment.amountToSettleCents))}</TableCell><TableCell className="max-w-44 truncate">{String(payment.ruleName ?? "—")}</TableCell><TableCell><StatusBadge status={String(payment.status)} /></TableCell></TableRow>)}
      {!payments.length ? <TableRow><TableCell colSpan={9} className="h-32 text-center text-muted-foreground">Nenhum pagamento encontrado.</TableCell></TableRow> : null}
    </TableBody></Table></div>
  </div>;
}
