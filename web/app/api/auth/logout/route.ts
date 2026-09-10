import { NextResponse } from "next/server";

import { getD1 } from "@/db";
import { assertSameOrigin, getCurrentUser, audit, SESSION_COOKIE } from "@/lib/auth";
import { sha256 } from "@/lib/security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const token = request.headers.get("cookie")?.match(/(?:^|;\s*)controle_session=([^;]+)/)?.[1];
    const user = await getCurrentUser();
    if (token) await getD1().prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(decodeURIComponent(token))).run();
    if (user) await audit(user.id, "LOGOUT", "session");
  } catch {
    // Encerrar no navegador continua sendo seguro mesmo se o banco estiver indisponível.
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", expires: new Date(0) });
  return response;
}
