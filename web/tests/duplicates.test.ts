import { describe, expect, it } from "vitest";
import { buildDuplicateKey } from "@/lib/duplicates";

describe("duplicidades", () => {
  it("gera a mesma chave para o mesmo identificador bancário", async () => {
    const one = await buildDuplicateKey({ bankTransactionId: "ABC-1", unitId: "A", document: "1", originalAmountCents: 100, paymentDate: "2026-09-01" });
    const two = await buildDuplicateKey({ bankTransactionId: "abc-1", unitId: "B", document: "2", originalAmountCents: 200, paymentDate: "2026-09-02" });
    expect(one).toBe(two);
  });
  it("usa a combinação unidade, documento, valor e data quando não há id bancário", async () => {
    const base = { bankTransactionId: null, unitId: "A", document: "123.456.789-01", originalAmountCents: 14900, paymentDate: "2026-09-01" };
    expect(await buildDuplicateKey(base)).toBe(await buildDuplicateKey({ ...base, document: "12345678901" }));
    expect(await buildDuplicateKey(base)).not.toBe(await buildDuplicateKey({ ...base, unitId: "B" }));
  });
});
