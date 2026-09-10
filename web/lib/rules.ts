export type RuleCandidate = {
  id: string;
  name: string;
  compensatedAmountCents: number;
  deductionAmountCents: number;
  paymentMethod: string | null;
  unitId: string | null;
  plan: string | null;
  startDate: string;
  endDate: string | null;
  active: boolean | number;
};

export type PaymentForRule = {
  originalAmountCents: number;
  paymentMethod: string;
  unitId: string | null;
  plan: string | null;
  paymentDate: string;
};

const canonical = (value: string | null | undefined) => value?.trim().toLocaleUpperCase("pt-BR") ?? "";

export function applyDeductionRules(payment: PaymentForRule, rules: RuleCandidate[]) {
  const rule = rules.find((candidate) => {
    if (!candidate.active || candidate.compensatedAmountCents !== payment.originalAmountCents) return false;
    if (candidate.paymentMethod && canonical(candidate.paymentMethod) !== canonical(payment.paymentMethod)) return false;
    if (candidate.unitId && candidate.unitId !== payment.unitId) return false;
    if (candidate.plan && canonical(candidate.plan) !== canonical(payment.plan)) return false;
    if (payment.paymentDate < candidate.startDate) return false;
    if (candidate.endDate && payment.paymentDate > candidate.endDate) return false;
    return true;
  });

  const deductionAmountCents = rule ? Math.min(rule.deductionAmountCents, payment.originalAmountCents) : 0;
  return {
    ruleId: rule?.id ?? null,
    ruleName: rule?.name ?? null,
    deductionAmountCents,
    amountToSettleCents: payment.originalAmountCents - deductionAmountCents,
  };
}
