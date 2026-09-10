import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return <AppShell user={user}>{children}</AppShell>;
}
