import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { NETWORK_TIERS, type DbRole } from "@/lib/hierarchy";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/invite/parents?role=MASTER_DISTRIBUTOR
 *
 * Returns active users one tier above the given role — these are valid parents
 * for the new invitee. Only Master Admin needs this (Admin can only create SD
 * which has no parent).
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    throw e;
  }

  const isWlpRoot = user.role === "WHITELABEL_PARTNER";
  const isTenantMember = !isWlpRoot && Boolean((user as any).platformOwnerId);
  if (user.role !== "MASTER_ADMIN" && !isWlpRoot && !isTenantMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetRole = searchParams.get("role") as DbRole | null;

  if (!targetRole || !NETWORK_TIERS.includes(targetRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const tierIdx = NETWORK_TIERS.indexOf(targetRole);

  // SD has no parent — they're top-level network nodes
  if (tierIdx === NETWORK_TIERS.length - 1) {
    return NextResponse.json({ parents: [] });
  }

  const parentRole = NETWORK_TIERS[tierIdx + 1];

  // Tenant scope: WLP root → their own id; tenant member → their company's owner id.
  const tenantOwnerId = isWlpRoot
    ? user.id
    : isTenantMember
      ? (user as any).platformOwnerId
      : null;

  const parents = await prisma.user.findMany({
    where: {
      role: parentRole,
      status: "ACTIVE",
      ...(tenantOwnerId ? { platformOwnerId: tenantOwnerId } : {}),
    },
    select: {
      id: true,
      name: true,
      phone: true,
      shopName: true,
      city: true,
      state: true,
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  return NextResponse.json({ parents, parentRole });
}
