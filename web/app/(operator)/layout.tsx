import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function OperatorLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user.role !== "OPERATOR" || !user.unitGroupId) redirect("/admin");
  return <AppShell user={user}>{children}</AppShell>;
}
