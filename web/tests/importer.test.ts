import { describe, expect, it } from "vitest";
import { createXlsx } from "@/lib/xlsx-export";
import { parseImportFile } from "@/lib/importer";

describe("importação de relatórios", () => {
  it("encontra cabeçalhos e normaliza um CSV brasileiro", () => {
    const csv = [
      "Relatório bancário",
      "Id da Transação;Id da Cobrança;UUID;Nome da Loja;Chave da Transação;Nome;Documento do Cliente;Data de Pagamento;Método de Pagamento;Valor Pago;Nome da Empresa;Observação interna",
      "tx-1;cob-1;uuid-1;Loja Centro;chave-1;Maria;123.456.789-01;01/09/2026 14:35;PIX;149,00;Odontologia GBG;referência externa 42",
    ].join("\n");
    const parsed = parseImportFile("pagamentos.csv", new TextEncoder().encode(csv));
    const [record] = parsed.records;
    expect(record).toMatchObject({ bankTransactionId: "tx-1", chargeId: "cob-1", sourceUuid: "uuid-1", storeName: "Loja Centro", transactionKey: "chave-1", paymentMethod: "PIX", originalAmountCents: 14900, paymentDate: "2026-09-01", paymentReference: "2026-09-01T14:35:00", unitReference: "Odontologia GBG" });
    expect(parsed.sourceHeaders).toContain("Documento do Cliente");
    expect(record.sourceValues).toContain("123.456.789-01");
    expect(parsed.sourceHeaders).toContain("Observação interna");
    expect(record.sourceValues[parsed.sourceHeaders.indexOf("Observação interna")]).toBe("referência externa 42");
  });

  it("lê uma planilha XLSX simples", () => {
    const bytes = createXlsx(["Nome", "Documento", "Data de Pagamento", "Forma de Pagamento", "Valor", "Unidade"], [["João", "1", "2026-09-02", "Boleto", 60, "129"]]);
    const { records: [record] } = parseImportFile("pagamentos.xlsx", bytes);
    expect(record).toMatchObject({ payerName: "João", paymentMethod: "BOLETO", originalAmountCents: 6000, paymentDate: "2026-09-02", unitReference: "129" });
  });
});
