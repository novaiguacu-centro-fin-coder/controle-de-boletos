export function parseMoneyToCents(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.round(value * 100);
  }
  if (typeof value !== "string") return null;

  let normalized = value.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (!normalized) return null;
  const negative = normalized.startsWith("-");
  normalized = normalized.replace(/[^0-9,.-]/g, "").replace(/-/g, "");

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  const decimalAt = Math.max(lastComma, lastDot);
  let integerPart = normalized;
  let decimalPart = "";
  if (decimalAt >= 0) {
    const candidate = normalized.slice(decimalAt + 1);
    if (candidate.length <= 2) {
      integerPart = normalized.slice(0, decimalAt);
      decimalPart = candidate;
    }
  }
  integerPart = integerPart.replace(/[.,]/g, "") || "0";
  decimalPart = decimalPart.padEnd(2, "0").slice(0, 2);
  if (!/^\d+$/.test(integerPart) || !/^\d{2}$/.test(decimalPart)) return null;
  const cents = Number(integerPart) * 100 + Number(decimalPart);
  if (!Number.isSafeInteger(cents)) return null;
  return negative ? -cents : cents;
}

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
}
