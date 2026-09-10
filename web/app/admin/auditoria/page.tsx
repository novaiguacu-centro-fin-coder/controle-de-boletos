import { PageTitle } from "@/components/page-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuditLogs } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await getAuditLogs();
  return <div className="space-y-6 p-4 md:p-7"><PageTitle title="Auditoria" description="Registro das operações importantes realizadas no sistema." />
    <div className="rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Data e hora</TableHead><TableHead>Usuário</TableHead><TableHead>Ação</TableHead><TableHead>Registro</TableHead><TableHead>Detalhes</TableHead></TableRow></TableHeader><TableBody>{logs.map((log) => <TableRow key={String(log.id)}><TableCell>{new Date(String(log.createdAt)).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</TableCell><TableCell className="font-medium">{String(log.username)}</TableCell><TableCell>{String(log.action).replaceAll("_", " ")}</TableCell><TableCell>{String(log.entity)} {log.entityId ? <span className="block max-w-32 truncate text-xs text-muted-foreground">{String(log.entityId)}</span> : null}</TableCell><TableCell className="max-w-md truncate text-xs text-muted-foreground">{String(log.metadata)}</TableCell></TableRow>)}{!logs.length ? <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">Nenhuma operação registrada.</TableCell></TableRow> : null}</TableBody></Table></div>
  </div>;
}
