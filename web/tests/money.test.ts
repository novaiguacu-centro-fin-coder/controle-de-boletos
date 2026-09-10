import { describe, expect, it } from "vitest";
import { parseMoneyToCents } from "@/lib/money";

describe("normalização monetária", () => {
  it.each([["149,00", 14900], ["R$ 1.234,56", 123456], [149, 14900], ["60.00", 6000]])("converte %s sem usar ponto flutuante persistido", (value, expected) => {
    expect(parseMoneyToCents(value)).toBe(expected);
  });
  it("rejeita valores ausentes", () => expect(parseMoneyToCents("")).toBeNull());
});
