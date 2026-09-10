"use client";

import { useEffect } from "react";

type ModelContext = { registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void> };

export function OperatorWebMcp() {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "list_operator_payments",
      title: "Consultar pagamentos liberados",
      description: "Lista somente os pagamentos liberados para a unidade do operador autenticado, sem valores originais ou deduções.",
      inputSchema: { type: "object", properties: { from: { type: "string" }, to: { type: "string" }, method: { type: "string", enum: ["BOLETO", "PIX", "CARTAO"] } }, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      async execute(input: { from?: string; to?: string; method?: string }) {
        const query = new URLSearchParams(Object.entries(input).filter((entry): entry is [string, string] => Boolean(entry[1])));
        const response = await fetch(`/api/operator/payments?${query}`);
        if (!response.ok) throw new Error("Não foi possível consultar os pagamentos.");
        return response.json();
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  return null;
}
