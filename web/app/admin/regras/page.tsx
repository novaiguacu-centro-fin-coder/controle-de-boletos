import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRules, getUnits } from "@/lib/data";
import { formatBRL, formatDateBR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const [rules, units] = await Promise.all([getRules(), getUnits()]);
  return <div className="space-y-6 p-4 md:p-7">
    <PageTitle title="Regras de dedução" description="As regras iniciais de R$ 60 e R$ 149 valem para boleto, PIX e cartão." />
    <Card><CardHeader><CardTitle>Nova regra</CardTitle></CardHeader><CardContent><form action="/api/admin/regras" method="post" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="name">Nome</Label><Input id="name" name="name" required placeholder="Ex.: Deduzir taxa operacional" /></div>
      <div className="space-y-2"><Label htmlFor="amount">Valor compensado</Label><Input id="amount" name="amount" required inputMode="decimal" placeholder="149,00" /></div>
      <div className="space-y-2"><Label htmlFor="deduction">Valor a deduzir</Label><Input id="deduction" name="deduction" required inputMode="decimal" placeholder="30,00" /></div>
      <div className="space-y-2"><Label htmlFor="method">Forma de pagamento</Label><NativeSelect id="method" name="method" className="w-full"><NativeSelectOption value="">Todas</NativeSelectOption><NativeSelectOption value="BOLETO">Boleto</NativeSelectOption><NativeSelectOption value="PIX">PIX</NativeSelectOption><NativeSelectOption value="CARTAO">Cartão</NativeSelectOption></NativeSelect></div>
      <div className="space-y-2"><Label htmlFor="unitId">Unidade</Label><NativeSelect id="unitId" name="unitId" className="w-full"><NativeSelectOption value="">Todas</NativeSelectOption>{units.filter((unit) => unit.active).map((unit) => <NativeSelectOption key={unit.id} value={unit.id}>{unit.name}</NativeSelectOption>)}</NativeSelect></div>
      <div className="space-y-2"><Label htmlFor="plan">Plano (opcional)</Label><Input id="plan" name="plan" /></div>
      <div className="space-y-2"><Label htmlFor="startDate">Início da vigência</Label><Input id="startDate" name="startDate" type="date" required defaultValue="2000-01-01" /></div>
      <div className="space-y-2"><Label htmlFor="endDate">Fim da vigência</Label><Input id="endDate" name="endDate" type="date" /></div>
      <div className="space-y-2 sm:col-span-2 xl:col-span-3"><Label htmlFor="reason">Motivo</Label><Input id="reason" name="reason" required /></div>
      <div className="flex items-end"><Button type="submit" className="w-full">Cadastrar regra</Button></div>
    </form></CardContent></Card>
    <div className="rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Regra</TableHead><TableHead className="text-right">Compensado</TableHead><TableHead className="text-right">Dedução</TableHead><TableHead>Forma</TableHead><TableHead>Unidade / Plano</TableHead><TableHead>Vigência</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>
      {rules.map((rule) => <TableRow key={String(rule.id)}><TableCell><p className="font-medium">{String(rule.name)}</p><p className="max-w-64 truncate text-xs text-muted-foreground">{String(rule.reason)}</p></TableCell><TableCell className="text-right">{formatBRL(Number(rule.compensatedAmountCents))}</TableCell><TableCell className="text-right font-semibold">{formatBRL(Number(rule.deductionAmountCents))}</TableCell><TableCell>{String(rule.paymentMethod ?? "Todas")}</TableCell><TableCell>{String(rule.unitName ?? "Todas")} {rule.plan ? <span className="block text-xs text-muted-foreground">Plano: {String(rule.plan)}</span> : null}</TableCell><TableCell>{formatDateBR(String(rule.startDate))}{rule.endDate ? ` a ${formatDateBR(String(rule.endDate))}` : " em diante"}</TableCell><TableCell><StatusBadge status={Number(rule.active) ? "ATIVO" : "INATIVO"} /></TableCell><TableCell><form action="/api/admin/regras/toggle" method="post"><input type="hidden" name="id" value={String(rule.id)} /><Button variant="ghost" size="sm">{Number(rule.active) ? "Desativar" : "Ativar"}</Button></form></TableCell></TableRow>)}
    </TableBody></Table></div>
  </div>;
}
