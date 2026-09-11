import { createClient } from "@libsql/client";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url) throw new Error("Defina TURSO_DATABASE_URL antes de aplicar as migrações.");
if (url.startsWith("libsql://") && !authToken) {
  throw new Error("Defina TURSO_AUTH_TOKEN antes de aplicar as migrações remotas.");
}

const client = createClient({ url, authToken });
await client.execute(`CREATE TABLE IF NOT EXISTS app_migrations (
  filename TEXT PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
)`);

const migrationDirectory = path.join(projectRoot, "drizzle");
const files = (await readdir(migrationDirectory))
  .filter((filename) => /^\d+.*\.sql$/.test(filename))
  .sort();

for (const filename of files) {
  const applied = await client.execute({
    sql: "SELECT 1 FROM app_migrations WHERE filename = ? LIMIT 1",
    args: [filename],
  });
  if (applied.rows.length) continue;

  const source = await readFile(path.join(migrationDirectory, filename), "utf8");
  const statements = source
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  await client.batch([
    ...statements,
    { sql: "INSERT INTO app_migrations (filename) VALUES (?)", args: [filename] },
  ], "write");
  console.log(`Migração aplicada: ${filename}`);
}

client.close();
