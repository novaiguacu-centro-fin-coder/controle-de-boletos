import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUnitGroups, getUsers, type SearchValues } from "@/lib/data";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const search = await searchParams;
  const [users, groups] = await Promise.all([getUsers(), getUnitGroups()]);
  return <div className="space-y-6 p-4 md:p-7"><PageTitle title="Usuários" description="Operadores ficam vinculados a uma unidade, e não a uma empresa individual." />
    {search.sucesso ? <Alert><AlertTitle>Atualizado</AlertTitle><AlertDescription>A unidade de acesso do usuário foi atualizada.</AlertDescription></Alert> : null}
    <Card><CardHeader><CardTitle>Novo usuário</CardTitle></CardHeader><CardContent><form action="/api/admin/usuarios" method="post" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:items-end"><div className="space-y-2"><Label htmlFor="username">Usuário</Label><Input id="username" name="username" required /></div><div className="space-y-2"><Label htmlFor="password">Senha inicial</Label><Input id="password" name="password" type="password" minLength={MIN_PASSWORD_LENGTH} required /></div><div className="space-y-2"><Label htmlFor="role">Perfil</Label><NativeSelect id="role" name="role" className="w-full"><NativeSelectOption value="OPERATOR">Operador</NativeSelectOption><NativeSelectOption value="ADMIN">Administrador</NativeSelectOption></NativeSelect></div><div className="space-y-2"><Label htmlFor="unitGroupId">Unidade</Label><NativeSelect id="unitGroupId" name="unitGroupId" className="w-full"><NativeSelectOption value="">Selecione</NativeSelectOption>{groups.map((group) => <NativeSelectOption key={group.id} value={group.id}>{group.name}</NativeSelectOption>)}</NativeSelect></div><Button type="submit">Criar usuário</Button></form></CardContent></Card>
    <div className="rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Perfil</TableHead><TableHead>Unidade</TableHead><TableHead>Status</TableHead><TableHead>Redefinir senha</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>{users.map((item) => <TableRow key={String(item.id)}><TableCell className="font-medium">{String(item.username)}</TableCell><TableCell>{item.role === "ADMIN" ? "Administrador" : "Operador"}</TableCell><TableCell><form action="/api/admin/usuarios/unidade" method="post" className="flex items-center gap-2"><input type="hidden" name="id" value={String(item.id)} /><NativeSelect name="unitGroupId" defaultValue={String(item.unitGroupId ?? "")} className="min-w-28"><NativeSelectOption value="">Todas</NativeSelectOption>{groups.map((group) => <NativeSelectOption key={group.id} value={group.id}>{group.name}</NativeSelectOption>)}</NativeSelect><Button size="sm" variant="outline">Salvar</Button></form></TableCell><TableCell><StatusBadge status={Number(item.active) ? "ATIVO" : "INATIVO"} /></TableCell><TableCell><form action="/api/admin/usuarios/senha" method="post" className="flex gap-2"><input type="hidden" name="id" value={String(item.id)} /><Input name="password" type="password" minLength={MIN_PASSWORD_LENGTH} required placeholder="Nova senha" className="h-9 max-w-36" /><Button size="sm" variant="outline">Salvar</Button></form></TableCell><TableCell><form action="/api/admin/usuarios/toggle" method="post"><input type="hidden" name="id" value={String(item.id)} /><Button size="sm" variant="ghost">{Number(item.active) ? "Desativar" : "Ativar"}</Button></form></TableCell></TableRow>)}</TableBody></Table></div>
  </div>;
}
