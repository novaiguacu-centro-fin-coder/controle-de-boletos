import { describe, expect, it } from "vitest";
import { buildDuplicateKey } from "@/lib/duplicates";

describe("duplicidades", () => {
  const base = { paymentReference: "2026-09-01T10:30:00", chargeId: "C-1", sourceUuid: "UUID-1", storeName: "Loja A", transactionKey: "KEY-1" };

  it("normaliza maiúsculas e espaços nos cinco identificadores", async () => {
    const one = await buildDuplicateKey(base);
    const two = await buildDuplicateKey({ paymentReference: " 2026-09-01t10:30:00 ", chargeId: " c-1 ", sourceUuid: "uuid-1", storeName: "loja a", transactionKey: "key-1" });
    expect(one).toBe(two);
  });

  it.each(["paymentReference", "chargeId", "sourceUuid", "storeName", "transactionKey"] as const)("considera nova transação quando %s muda", async (field) => {
    expect(await buildDuplicateKey(base)).not.toBe(await buildDuplicateKey({ ...base, [field]: `${base[field]}-OUTRO` }));
  });
});
