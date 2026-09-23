import { sha256 } from "@/lib/security";

export async function buildDuplicateKey(input: {
  paymentReference: string;
  chargeId: string;
  sourceUuid: string;
  storeName: string;
  transactionKey: string;
}) {
  const normalized = [input.paymentReference, input.chargeId, input.sourceUuid, input.storeName, input.transactionKey]
    .map((value) => value.normalize("NFKC").trim().toLocaleUpperCase("pt-BR"));
  return sha256(`payment-v2:${normalized.join("|")}`);
}
