import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const classes = status === "LIBERADO" || status === "CONCLUIDO" || status === "ATIVO"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : status === "DUPLICADO" || status.includes("ALERTA")
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : status === "EXCECAO" || status === "FALHA" || status === "INATIVO"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-sky-200 bg-sky-50 text-sky-700";
  return <Badge variant="outline" className={classes}>{status.replaceAll("_", " ")}</Badge>;
}
