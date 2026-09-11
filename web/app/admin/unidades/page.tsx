import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUnitGroups, getUnits, type SearchValues } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function UnitsPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const search = await searchParams;
  const [units, groups] = await Promise.all([getUnits(), getUnitGroups()]);
  return <div className="space-y-6 p-4 md:p-7"><PageTitle title="Empresas" description="Cadastre empresas e classifique cada uma em uma unidade De/Para." />
    {search.sucesso ? <Alert><AlertTitle>Atualizado</AlertTitle><AlertDescription>A unidade foi associada ao grupo selecionado.</AlertDescription></Alert> : null}
    {search.erro ? <Alert variant="destructive"><AlertTitle>Não foi possível salvar</AlertTitle><AlertDescription>Confira os dados informados.</AlertDescription></Alert> : null}
    <Card><CardHeader><CardTitle>De/Para de empresas</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">As unidades NI, SJM, Vilar e BR já foram criadas. Associe cada empresa à unidade correspondente.</p><div className="rounded-xl border"><Table><TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>Código</TableHead><TableHead>Unidade</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>{units.map((unit) => <TableRow key={unit.id}><TableCell className="font-medium">{unit.name}</TableCell><TableCell>{unit.code}</TableCell><TableCell><form action="/api/admin/unidades/grupo" method="post" className="flex items-center gap-2"><input type="hidden" name="id" value={unit.id} /><select name="groupId" defaultValue={unit.groupId ?? ""} className="h-9 min-w-32 rounded-md border bg-background px-2 text-sm"><option value="">Sem unidade</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select><Button size="sm" variant="outline" type="submit">Salvar</Button></form></TableCell><TableCell><StatusBadge status={unit.active ? "ATIVO" : "INATIVO"} /></TableCell><TableCell className="text-right"><form action="/api/admin/unidades/toggle" method="post"><input type="hidden" name="id" value={unit.id} /><Button size="sm" variant="ghost">{unit.active ? "Desativar" : "Ativar"}</Button></form></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
  </div>;
}
