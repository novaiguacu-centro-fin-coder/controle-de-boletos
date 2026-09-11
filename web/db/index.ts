import { createClient, type Client, type InStatement, type InValue } from "@libsql/client";

type RunResult = {
  success: true;
  meta: { changes: number };
};

class PreparedStatement {
  constructor(
    private readonly client: Client,
    private readonly sql: string,
    private readonly args: InValue[] = [],
  ) {}

  bind(...args: unknown[]) {
    return new PreparedStatement(this.client, this.sql, args.map(toInValue));
  }

  async first<T>(): Promise<T | null> {
    const result = await this.client.execute(this.toInStatement());
    return (result.rows[0] as T | undefined) ?? null;
  }

  async all<T>(): Promise<{ success: true; results: T[] }> {
    const result = await this.client.execute(this.toInStatement());
    return { success: true, results: result.rows as unknown as T[] };
  }

  async run(): Promise<RunResult> {
    const result = await this.client.execute(this.toInStatement());
    return { success: true, meta: { changes: result.rowsAffected } };
  }

  toInStatement(): InStatement {
    return { sql: this.sql, args: this.args };
  }
}

class Database {
  constructor(private readonly client: Client) {}

  prepare(sql: string) {
    return new PreparedStatement(this.client, sql);
  }

  async batch(statements: PreparedStatement[]): Promise<RunResult[]> {
    const results = await this.client.batch(
      statements.map((statement) => statement.toInStatement()),
      "write",
    );
    return results.map((result) => ({
      success: true,
      meta: { changes: result.rowsAffected },
    }));
  }
}

let database: Database | undefined;

function toInValue(value: unknown): InValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean" ||
    value instanceof Uint8Array
  ) {
    return value;
  }
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (value instanceof Date) return value.toISOString();
  throw new TypeError("Parâmetro SQL inválido.");
}

export function getD1(): Database {
  if (database) return database;

  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!url) throw new Error("Banco de dados temporariamente indisponível.");
  if (url.startsWith("libsql://") && !authToken) {
    throw new Error("Banco de dados temporariamente indisponível.");
  }

  database = new Database(createClient({ url, authToken }));
  return database;
}
