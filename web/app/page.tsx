import { ArrowRight, Building2, CheckCircle2, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, hasUsers } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (!(await hasUsers())) redirect("/configuracao-inicial");
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/pagamentos");
  const { erro } = await searchParams;
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1480px] lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden overflow-hidden bg-[#0b2f4a] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-cyan-400 text-[#0b2f4a] shadow-lg shadow-cyan-950/20">
              <FileSpreadsheet className="size-6" />
            </span>
            <div>
              <p className="text-lg font-semibold">Controle de Pagamentos</p>
              <p className="text-sm text-sky-100/70">Operação financeira por unidade</p>
            </div>
          </div>

          <div className="relative max-w-xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Fluxo seguro e conferível</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Do arquivo do banco ao valor certo para baixa.</h1>
            <div className="mt-10 grid gap-4 text-base text-sky-50/85">
              <div className="flex items-center gap-3"><CheckCircle2 className="size-5 text-cyan-300" />Importações organizadas em lotes</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="size-5 text-cyan-300" />Regras de dedução configuráveis</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="size-5 text-cyan-300" />Cada operador enxerga somente sua unidade</div>
            </div>
          </div>

          <p className="relative text-sm text-sky-100/55">Valores em reais • Datas no horário de São Paulo</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[440px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><FileSpreadsheet className="size-5" /></span>
              <p className="font-semibold">Controle de Pagamentos</p>
            </div>

            <div className="mb-8">
              <div className="mb-5 grid size-12 place-items-center rounded-2xl border border-border bg-card shadow-sm"><Building2 className="size-6 text-primary" /></div>
              <h2 className="text-3xl font-semibold tracking-tight">Acesse sua conta</h2>
              <p className="mt-2 text-base text-muted-foreground">Entre para consultar, importar ou liberar pagamentos.</p>
            </div>

            <form action="/api/auth/login" method="post" className="space-y-5">
              {erro ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Não foi possível entrar. Confira o usuário e a senha.</p> : null}
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input id="username" name="username" autoComplete="username" required minLength={2} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required minLength={12} className="h-12" />
              </div>
              <Button type="submit" className="h-12 w-full text-base">Entrar <ArrowRight className="size-4" /></Button>
            </form>

            <div className="mt-8 flex gap-3 rounded-xl border border-border bg-muted/55 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <p>O acesso é protegido e as informações são separadas automaticamente por unidade.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
