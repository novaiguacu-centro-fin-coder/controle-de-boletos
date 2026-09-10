import type { ReactNode } from "react";

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>{description ? <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p> : null}</div>
    {actions ? <div className="flex flex-wrap gap-2 print:hidden">{actions}</div> : null}
  </div>;
}
