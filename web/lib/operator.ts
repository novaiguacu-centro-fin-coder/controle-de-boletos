export type InternalPayment = {
  id: string;
  payerName: string;
  document: string;
  paymentDate: string;
  paymentMethod: string;
  amountToSettleCents: number;
  originalAmountCents?: number;
  deductionAmountCents?: number;
  ruleId?: string | null;
  unitId?: string | null;
};

export function getOperatorUnit(user: { role: string; unitGroupId?: string | null; unitId?: string | null }): string {
  const groupId = user.unitGroupId ?? user.unitId ?? null;
  if (user.role !== "OPERATOR" || !groupId) throw new Error("Operador sem unidade autorizada.");
  return groupId;
}

export function toOperatorPayment(payment: InternalPayment) {
  return {
    id: payment.id,
    payerName: payment.payerName,
    document: payment.document,
    paymentDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    amountToSettleCents: payment.amountToSettleCents,
  };
}

export function groupPaymentsByDay<T extends { paymentDate: string; amountToSettleCents: number }>(payments: T[]) {
  const groups = new Map<string, { date: string; payments: T[]; subtotalCents: number }>();
  for (const payment of payments) {
    const group = groups.get(payment.paymentDate) ?? { date: payment.paymentDate, payments: [], subtotalCents: 0 };
    group.payments.push(payment);
    group.subtotalCents += payment.amountToSettleCents;
    groups.set(payment.paymentDate, group);
  }
  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date));
}
