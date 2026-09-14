import { FileUp, ShieldAlert } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getImportBatches, type SearchValues } from "@/lib/data";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ImportsPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const search = await searchParams;
  const batches = await getImportBatches();
  return <div className="space-y-6 p-4 md:p-7">
    <PageTitle title="Importações" description="Envie o relatório do banco e confira o lote antes de liberar." />
    {search.erro ? <Alert variant="destructive"><ShieldAlert /><AlertTitle>Importação não concluída</AlertTitle><AlertDescription>Confira se o arquivo é CSV ou XLSX e se possui os cabeçalhos de pagamento, valor e unidade.</AlertDescription></Alert> : null}
    {search.lote ? <Alert><FileUp /><AlertTitle>Lote importado</AlertTitle><AlertDescription>Os registros válidos estão aguardando liberação. Duplicados e exceções ficaram bloqueados.</AlertDescription></Alert> : null}
    <Card><CardHeader><CardTitle>Novo lote</CardTitle></CardHeader><CardContent><form action="/api/admin/importacoes" method="post" encType="multipart/form-data" className="flex flex-col gap-4 sm:flex-row sm:items-end"><div className="flex-1 space-y-2"><Label htmlFor="file">Arquivo do banco</Label><Input id="file" name="file" type="file" accept=".csv,.xlsx" required className="h-11 file:mr-3" /><p className="text-xs text-muted-foreground">CSV ou XLSX, até 4 MB por arquivo. Todas as colunas originais serão preservadas, sem sobrescrever registros existentes.</p></div><Button type="submit" className="h-11"><FileUp />Importar arquivo</Button></form></CardContent></Card>
    <Card><CardHeader><CardTitle>Histórico de lotes</CardTitle></CardHeader><CardContent className="px-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Arquivo</TableHead><TableHead>Importado por</TableHead><TableHead className="text-right">Registros</TableHead><TableHead className="text-right">Válidos</TableHead><TableHead className="text-right">Duplicados</TableHead><TableHead className="text-right">Exceções</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>
      {batches.map((batch) => <TableRow key={String(batch.id)}><TableCell className="pl-6"><p className="max-w-64 truncate font-medium">{String(batch.filename)}</p><p className="text-xs text-muted-foreground">{new Date(String(batch.importedAt)).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p></TableCell><TableCell>{String(batch.username)}</TableCell><TableCell className="text-right">{Number(batch.totalRecords)}</TableCell><TableCell className="text-right">{Number(batch.validRecords)}</TableCell><TableCell className="text-right">{Number(batch.duplicateRecords)}</TableCell><TableCell className="text-right">{Number(batch.rejectedRecords)}</TableCell><TableCell className="text-right font-medium">{formatBRL(Number(batch.totalAmountCents))}</TableCell><TableCell><StatusBadge status={String(batch.status)} /></TableCell><TableCell>{Number(batch.validRecords) > 0 ? <form action="/api/admin/pagamentos/liberar" method="post"><input type="hidden" name="batchId" value={String(batch.id)} /><Button size="sm" variant="outline">Liberar válidos</Button></form> : null}</TableCell></TableRow>)}
      {!batches.length ? <TableRow><TableCell colSpan={9} className="h-28 text-center text-muted-foreground">Nenhum lote importado.</TableCell></TableRow> : null}
    </TableBody></Table></CardContent></Card>
  </div>;
}
