import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getD1 } from "@/db";
import { sha256 } from "@/lib/security";

export const SESSION_COOKIE = "controle_session";

export type AppUser = {
  id: string;
  username: string;
  role: "ADMIN" | "OPERATOR";
  unitId: string | null;
  unitName: string | null;
  unitGroupId: string | null;
  unitGroupName: string | null;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await getD1().prepare(`
    SELECT u.id, u.username, u.role, u.unit_id AS unitId,
      COALESCE(u.unit_group_id, un.group_id) AS unitGroupId,
      COALESCE(ug.name, ug2.name) AS unitGroupName,
      COALESCE(ug.name, ug2.name, un.name) AS unitName
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN units un ON un.id = u.unit_id
    LEFT JOIN unit_groups ug ON ug.id = u.unit_group_id
    LEFT JOIN unit_groups ug2 ON ug2.id = un.group_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1
    LIMIT 1
  `).bind(tokenHash, new Date().toISOString()).first<AppUser>();
  return row ?? null;
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/pagamentos");
  return user;
}

export async function hasUsers(): Promise<boolean> {
  const row = await getD1().prepare("SELECT COUNT(*) AS total FROM users").first<{ total: number }>();
  return Number(row?.total ?? 0) > 0;
}

export async function audit(userId: string | null, action: string, entity: string, entityId?: string | null, metadata?: Record<string, unknown>) {
  await getD1().prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity, entity_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), userId, action, entity, entityId ?? null, JSON.stringify(metadata ?? {})).run();
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new Error("Origem da requisição inválida.");
}
