import { sha256 } from "@/lib/security";

export async function buildDuplicateKey(input: {
  bankTransactionId: string | null;
  unitId: string | null;
  document: string;
  originalAmountCents: number;
  paymentDate: string;
}) {
  const bankId = input.bankTransactionId?.trim().toLocaleUpperCase("pt-BR");
  const document = input.document.replace(/\D/g, "");
  return sha256(bankId
    ? `bank:${bankId}`
    : `fallback:${input.unitId ?? "?"}|${document}|${input.originalAmountCents}|${input.paymentDate}`);
}
