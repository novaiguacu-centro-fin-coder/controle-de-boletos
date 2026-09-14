import { describe, expect, it } from "vitest";
import { getOperatorUnit, groupPaymentsByDay, toOperatorPayment } from "@/lib/operator";

describe("segurança do operador", () => {
  it("expõe somente os campos necessários", () => {
    const dto = toOperatorPayment({ id: "1", payerName: "Maria", document: "12345678901", paymentDate: "2026-09-01", paymentMethod: "PIX", amountToSettleCents: 11900, originalAmountCents: 14900, deductionAmountCents: 3000, ruleId: "r", unitId: "B" });
    expect(dto).toEqual({ id: "1", payerName: "Maria", document: "12345678901", paymentDate: "2026-09-01", paymentMethod: "PIX", amountToSettleCents: 11900 });
    expect(dto).not.toHaveProperty("originalAmountCents");
    expect(dto).not.toHaveProperty("deductionAmountCents");
    expect(dto).not.toHaveProperty("unitId");
  });
  it("exige a unidade da sessão", () => {
    expect(getOperatorUnit({ role: "OPERATOR", unitId: "A" })).toBe("A");
    expect(() => getOperatorUnit({ role: "OPERATOR", unitId: null })).toThrow();
    expect(() => getOperatorUnit({ role: "ADMIN", unitId: "B" })).toThrow();
  });
});

describe("relatório", () => {
  it("agrupa somente os dias com pagamentos e calcula subtotais", () => {
    const groups = groupPaymentsByDay([
      { paymentDate: "2026-09-03", amountToSettleCents: 3000 },
      { paymentDate: "2026-09-01", amountToSettleCents: 11900 },
      { paymentDate: "2026-09-01", amountToSettleCents: 6000 },
    ]);
    expect(groups.map((group) => group.date)).toEqual(["2026-09-01", "2026-09-03"]);
    expect(groups[0].subtotalCents).toBe(17900);
  });
});
