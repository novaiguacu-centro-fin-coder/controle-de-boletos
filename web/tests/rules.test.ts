import { describe, expect, it } from "vitest";
import { applyDeductionRules, type RuleCandidate } from "@/lib/rules";

const globalRules: RuleCandidate[] = [
  { id: "60", name: "60 - 30", compensatedAmountCents: 6000, deductionAmountCents: 3000, paymentMethod: null, unitId: null, plan: null, startDate: "2000-01-01", endDate: null, active: true },
  { id: "149", name: "149 - 30", compensatedAmountCents: 14900, deductionAmountCents: 3000, paymentMethod: null, unitId: null, plan: null, startDate: "2000-01-01", endDate: null, active: true },
];

function payment(amount: number, method = "BOLETO") {
  return { originalAmountCents: amount, paymentMethod: method, unitId: "A", plan: null, paymentDate: "2026-09-10" };
}

describe("regras de dedução", () => {
  it.each([[6000, 3000], [14900, 11900], [10000, 10000]])("calcula %i para %i", (original, expected) => {
    expect(applyDeductionRules(payment(original), globalRules).amountToSettleCents).toBe(expected);
  });
  it.each(["BOLETO", "PIX", "CARTAO"])("aplica as regras iniciais globais a %s", (method) => {
    expect(applyDeductionRules(payment(14900, method), globalRules).amountToSettleCents).toBe(11900);
  });
  it("mantém suporte a uma regra futura restrita por forma", () => {
    const boletoOnly = [{ ...globalRules[1], paymentMethod: "BOLETO" }];
    expect(applyDeductionRules(payment(14900, "BOLETO"), boletoOnly).amountToSettleCents).toBe(11900);
    expect(applyDeductionRules(payment(14900, "PIX"), boletoOnly).amountToSettleCents).toBe(14900);
  });
});
