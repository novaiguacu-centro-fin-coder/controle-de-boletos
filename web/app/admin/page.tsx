import { AlertTriangle, CheckCheck, CircleDollarSign, CopyCheck, FileInput, Split } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminPayments, getDashboardMetrics } from "@/lib/data";
import { formatBRL, formatDateBR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [metrics, payments] = await Promise.all([getDashboardMetrics(), getAdminPayments({})]);
  const cards = [
    ["Importados hoje", Number(metrics?.importedToday ?? 0).toLocaleString("pt-BR"), FileInput],
    ["Total compensado", formatBRL(Number(metrics?.originalTotalCents ?? 0)), CircleDollarSign],
    ["Total a baixar", formatBRL(Number(metrics?.settleTotalCents ?? 0)), CheckCheck],
    ["Deduções", formatBRL(Number(metrics?.deductionTotalCents ?? 0)), Split],
    ["Duplicados", Number(metrics?.duplicateCount ?? 0).toLocaleString("pt-BR"), CopyCheck],
    ["Exceções", Number(metrics?.exceptionCount ?? 0).toLocaleString("pt-BR"), AlertTriangle],
  ] as const;
  return <div className="space-y-7 p-4 md:p-7">
    <PageTitle title="Dashboard" description="Acompanhe o processamento dos pagamentos de hoje." />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([label, value, Icon]) => <Card key={label} className="shadow-sm"><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><Icon className="size-5 text-primary" /></CardHeader><CardContent><p className="text-2xl font-semibold tracking-tight">{value}</p></CardContent></Card>)}
    </section>
    <Card><CardHeader><CardTitle>Pagamentos recentes</CardTitle></CardHeader><CardContent className="px-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Data</TableHead><TableHead>Unidade</TableHead><TableHead>Pagador</TableHead><TableHead>Forma</TableHead><TableHead className="text-right">A baixar</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
      {payments.slice(0, 10).map((payment) => <TableRow key={String(payment.id)}><TableCell className="pl-6">{formatDateBR(String(payment.paymentDate))}</TableCell><TableCell>{String(payment.unitName)}</TableCell><TableCell className="font-medium">{String(payment.payerName)}</TableCell><TableCell>{String(payment.paymentMethod)}</TableCell><TableCell className="text-right font-semibold">{formatBRL(Number(payment.amountToSettleCents))}</TableCell><TableCell><StatusBadge status={String(payment.status)} /></TableCell></TableRow>)}
      {!payments.length ? <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">Nenhum pagamento importado ainda.</TableCell></TableRow> : null}
    </TableBody></Table></CardContent></Card>
  </div>;
}
