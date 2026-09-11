import { describe, expect, it } from "vitest";

import { isValidPassword, MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

describe("política de senha", () => {
  it("aceita uma senha numérica de quatro caracteres", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(4);
    expect(isValidPassword("1234")).toBe(true);
  });

  it("rejeita senhas com menos de quatro caracteres", () => {
    expect(isValidPassword("123")).toBe(false);
  });

  it("continua aceitando senhas maiores", () => {
    expect(isValidPassword("senha-segura")).toBe(true);
  });
});
