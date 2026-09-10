import { strFromU8, unzipSync } from "fflate";

import { parseMoneyToCents } from "@/lib/money";

export type ImportedPayment = {
  bankTransactionId: string | null;
  payerName: string;
  document: string;
  paymentDate: string | null;
  compensationDate: string | null;
  paymentMethod: string;
  plan: string | null;
  originalAmountCents: number | null;
  unitReference: string;
};

function cleanHeader(value: unknown): string {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function xmlDecode(value: string): string {
  return value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}

function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiters = [";", ",", "\t"];
  const delimiter = delimiters.sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell); cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function columnIndex(reference: string): number {
  const letters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? "A";
  let result = 0;
  for (const letter of letters) result = result * 26 + letter.charCodeAt(0) - 64;
  return result - 1;
}

function parseWorksheet(xml: string, sharedStrings: string[]): string[][] {
  const rows: string[][] = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1];
      const body = cellMatch[2];
      const reference = attributes.match(/\br="([^"]+)"/)?.[1] ?? "A1";
      const type = attributes.match(/\bt="([^"]+)"/)?.[1] ?? "n";
      const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? body.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/)?.[1] ?? "";
      const value = type === "s" ? sharedStrings[Number(raw)] ?? "" : xmlDecode(raw);
      row[columnIndex(reference)] = value;
    }
    if (row.some((value) => String(value ?? "").trim())) rows.push(row);
  }
  return rows;
}

function parseXlsx(bytes: Uint8Array): string[][] {
  const files = unzipSync(bytes);
  const sharedXml = files["xl/sharedStrings.xml"] ? strFromU8(files["xl/sharedStrings.xml"]) : "";
  const sharedStrings = [...sharedXml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
    [...match[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((text) => xmlDecode(text[1])).join(""),
  );
  const sheets = Object.keys(files).filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  let best: string[][] = [];
  let bestScore = -1;
  for (const sheet of sheets) {
    const rows = parseWorksheet(strFromU8(files[sheet]), sharedStrings);
    const score = Math.max(...rows.slice(0, 30).map((row) => row.map(cleanHeader).filter((value) => KNOWN_HEADERS.has(value)).length), 0);
    if (score > bestScore) { best = rows; bestScore = score; }
  }
  return best;
}

const ALIASES = {
  bankTransactionId: ["iddatransacao", "identificadorbancario", "idtransacao", "nsu", "uuid"],
  payerName: ["nome", "nomedocliente", "nomedopagador", "cliente", "pagador"],
  document: ["documentodocliente", "documento", "cpfcnpj", "cpf", "cnpj"],
  paymentDate: ["datadepagamento", "datadatransacao", "datapagamento", "data"],
  compensationDate: ["datadecompensacao", "datacompensacao", "dataderegistro"],
  paymentMethod: ["metododepagamento", "formadepagamento", "metodo", "forma"],
  plan: ["nomedoplano", "plano"],
  amount: ["valorpago", "valorcompensado", "valor"],
  unit: ["nomedaempresa", "unidade", "clinica", "iddempresa", "iddaempresa", "codigodaunidade"],
} as const;

const KNOWN_HEADERS: Set<string> = new Set(Object.values(ALIASES).flat());

function valueAt(row: string[], headers: Map<string, number>, aliases: readonly string[]): string {
  for (const alias of aliases) {
    const index = headers.get(alias);
    if (index !== undefined && String(row[index] ?? "").trim()) return String(row[index]).trim();
  }
  return "";
}

function excelDate(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const br = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (br) return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  const serial = Number(raw);
  if (Number.isFinite(serial) && serial > 20_000 && serial < 100_000) {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86_400_000);
    return date.toISOString().slice(0, 10);
  }
  return null;
}

function paymentMethod(value: string): string {
  const canonical = cleanHeader(value);
  if (canonical.includes("pix")) return "PIX";
  if (canonical.includes("cart")) return "CARTAO";
  if (canonical.includes("boleto")) return "BOLETO";
  return value.trim().toLocaleUpperCase("pt-BR") || "NAO_INFORMADO";
}

export function parseImportFile(filename: string, bytes: Uint8Array): ImportedPayment[] {
  const rows = filename.toLowerCase().endsWith(".xlsx") ? parseXlsx(bytes) : parseCsv(new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, ""));
  if (!rows.length) return [];
  let headerIndex = -1;
  let headers = new Map<string, number>();
  let bestScore = -1;
  for (let index = 0; index < Math.min(rows.length, 40); index += 1) {
    const candidate = new Map(rows[index].map((value, column) => [cleanHeader(value), column] as const));
    const score = [...candidate.keys()].filter((key) => KNOWN_HEADERS.has(key)).length;
    if (score >= 3 && score > bestScore) { headerIndex = index; headers = candidate; bestScore = score; }
  }
  if (headerIndex < 0) throw new Error("Não foi possível identificar os cabeçalhos do arquivo.");

  return rows.slice(headerIndex + 1).filter((row) => row.some((value) => String(value ?? "").trim())).map((row) => ({
    bankTransactionId: valueAt(row, headers, ALIASES.bankTransactionId) || null,
    payerName: valueAt(row, headers, ALIASES.payerName),
    document: valueAt(row, headers, ALIASES.document),
    paymentDate: excelDate(valueAt(row, headers, ALIASES.paymentDate)),
    compensationDate: excelDate(valueAt(row, headers, ALIASES.compensationDate)),
    paymentMethod: paymentMethod(valueAt(row, headers, ALIASES.paymentMethod)),
    plan: valueAt(row, headers, ALIASES.plan) || null,
    originalAmountCents: parseMoneyToCents(valueAt(row, headers, ALIASES.amount)),
    unitReference: valueAt(row, headers, ALIASES.unit),
  }));
}

export function normalizeUnitReference(value: string): string {
  return cleanHeader(value);
}
