import { afterEach, describe, expect, it } from "vitest";
import { createClient, type Client } from "@libsql/client";
import { IMPORT_STATUS_SQL } from "@/lib/import-status";

const clients: Client[] = [];
afterEach(() => { for (const db of clients.splice(0)) db.close(); });
async function database() {
  const db = createClient({ url: "file::memory:" });
  clients.push(db);
  await db.execute("CREATE TABLE payments (id INTEGER PRIMARY KEY, duplicate_key TEXT, status TEXT)");
  return db;
}
function insert(key: string, candidate = "VALIDADO") {
  return { sql: `INSERT INTO payments (duplicate_key,status) VALUES (?, ${IMPORT_STATUS_SQL})`, args: [key,candidate,key] };
}
describe("classificação atômica de importações", () => {
  it("preserva apenas uma ocorrência válida em lotes concorrentes e reimportações", async () => {
    const db = await database();
    // Ambos os importadores teriam observado ausência da chave antes de gravar.
    const before = await Promise.all([db.execute("SELECT * FROM payments"),db.execute("SELECT * FROM payments")]);
    expect(before.every(r => r.rows.length === 0)).toBe(true);
    await Promise.all([db.batch([insert("A"),insert("B")],"write"),db.batch([insert("A"),insert("B")],"write")]);
    await db.batch([insert("A"),insert("B")],"write");
    const result = await db.execute("SELECT status,COUNT(*) n FROM payments GROUP BY status ORDER BY status");
    expect(result.rows.map(r=>[r.status,r.n])).toEqual([["DUPLICADO",4],["VALIDADO",2]]);
  });
  it.each(["VALIDADO","LIBERADO","BAIXADO"])("reconhece ocorrência anterior %s", async status => {
    const db = await database();
    await db.execute({sql:"INSERT INTO payments (duplicate_key,status) VALUES (?,?)",args:["A",status]});
    await db.execute(insert("A"));
    expect((await db.execute("SELECT status FROM payments WHERE id=2")).rows[0].status).toBe("DUPLICADO");
  });
  it("não deixa exceções consumirem a identidade nem transforma entrada inválida em duplicado", async () => {
    const db = await database();
    await db.batch([insert("A","EXCECAO"),insert("A"),insert("A","EXCECAO"),insert("A")],"write");
    expect((await db.execute("SELECT status FROM payments ORDER BY id")).rows.map(r=>r.status)).toEqual(["EXCECAO","VALIDADO","EXCECAO","DUPLICADO"]);
  });
});
