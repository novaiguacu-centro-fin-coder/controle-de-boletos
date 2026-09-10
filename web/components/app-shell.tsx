"use client";

import type { ReactNode } from "react";
import { Building2, ClipboardList, FileDown, FileSpreadsheet, Gauge, ListChecks, LogOut, ScrollText, Settings2, Users } from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import type { AppUser } from "@/lib/auth";

const adminLinks = [
  ["/admin", "Dashboard", Gauge], ["/admin/pagamentos", "Pagamentos", ClipboardList],
  ["/admin/importacoes", "Importações", FileSpreadsheet], ["/admin/regras", "Regras", Settings2],
  ["/admin/unidades", "Unidades", Building2], ["/admin/usuarios", "Usuários", Users],
  ["/admin/relatorios", "Relatórios", FileDown], ["/admin/auditoria", "Auditoria", ScrollText],
] as const;
const operatorLinks = [["/pagamentos", "Pagamentos", ListChecks], ["/relatorio", "Relatório", FileDown]] as const;

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const links = user.role === "ADMIN" ? adminLinks : operatorLinks;
  return (
    <SidebarProvider>
      <Sidebar className="border-r border-[#163d55] bg-[#0b2f4a] text-white">
        <SidebarHeader className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-cyan-400 text-[#0b2f4a]"><FileSpreadsheet className="size-5" /></span>
            <div className="leading-tight"><p className="font-semibold">Controle</p><p className="text-sm text-sky-100/60">de pagamentos</p></div>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-[#0b2f4a]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sky-100/50">{user.role === "ADMIN" ? "Administração" : "Operação"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map(([href, label, Icon]) => <SidebarMenuItem key={href}><SidebarMenuButton asChild className="text-sky-50 hover:bg-white/10 hover:text-white"><a href={href}><Icon /><span>{label}</span></a></SidebarMenuButton></SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/10 bg-[#0b2f4a] p-4">
          <p className="px-2 text-sm font-medium">{user.username}</p>
          <p className="mb-2 px-2 text-xs text-sky-100/55">{user.unitName ?? "Todas as unidades"}</p>
          <form action="/api/auth/logout" method="post"><SidebarMenuButton type="submit" className="text-sky-50 hover:bg-white/10 hover:text-white"><LogOut /><span>Sair</span></SidebarMenuButton></form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white/95 px-4 backdrop-blur md:px-7 print:hidden">
          <SidebarTrigger />
          <div className="h-5 w-px bg-border" />
          <p className="text-sm text-muted-foreground">{user.role === "ADMIN" ? "Visão administrativa" : user.unitName}</p>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
