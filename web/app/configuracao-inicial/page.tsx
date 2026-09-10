import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasUsers } from "@/lib/auth";

export default async function InitialSetupPage() {
  if (await hasUsers()) redirect("/");
  return <main className="grid min-h-screen place-items-center bg-background p-5"><section className="w-full max-w-lg rounded-2xl border bg-card p-7 shadow-xl shadow-slate-900/5 sm:p-10">
    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground"><KeyRound /></div>
    <h1 className="text-3xl font-semibold tracking-tight">Configuração inicial</h1>
    <p className="mt-2 text-muted-foreground">Crie o primeiro administrador. As cinco unidades existentes e as regras globais de R$ 30,00 serão preparadas automaticamente.</p>
    <form action="/api/setup" method="post" className="mt-8 space-y-5">
      <div className="space-y-2"><Label htmlFor="username">Usuário administrador</Label><Input id="username" name="username" required minLength={2} autoComplete="username" /></div>
      <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" name="password" required minLength={4} type="password" autoComplete="new-password" /><p className="text-xs text-muted-foreground">Mínimo de 4 caracteres; pode ser numérica.</p></div>
      <Button className="h-11 w-full" type="submit">Criar administrador e iniciar</Button>
    </form>
  </section></main>;
}
