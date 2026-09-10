import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOperatorPayments } from "@/lib/data";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OPERATOR" || !user.unitGroupId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const payments = await getOperatorPayments(user, searchParams);
  return NextResponse.json({ unit: user.unitName, payments });
}
