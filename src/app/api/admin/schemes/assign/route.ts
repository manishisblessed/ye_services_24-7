import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminActivity } from "@/lib/security/adminActivity";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { prisma } from "@/lib/db";
import { tenantUserWhere } from "@/lib/security/ownership";
import { schemeNamespaceWhere } from "@/lib/scheme/tenant";

export const fetchCache = "force-no-store";

export const dynamic = "force-dynamic";

const AssignBody = z
  .object({
    schemeId: z.string().min(1).nullable().default(null),
    userIds: z.array(z.string().min(1)).min(1).max(5000),
  })
  .strict();

/**
 * POST /api/admin/schemes/assign
 *
 * Admin assigns (or unassigns) a scheme to ANY network user (SD, MD, DT, RT).
 * Direct assignment to any tier lets the admin override the cascade for
 * individual users without touching the rest of the hierarchy.
 * Unassigning (schemeId null) is always allowed.
 */
export async function POST(req: Request) {
  let admin;
  try {
    admin = await requireAdminActivity(req, {
      action: "scheme.assign",
      roles: ["MASTER_ADMIN", "ADMIN", "WHITELABEL_PARTNER"],
      entity: "Scheme",
    });
    await enforceRateLimit(`scheme:assign:${admin.id}`, RATE_LIMITS.default);
  } catch (e: unknown) {
    return toErrorResponse(e);
  }

  const parsed = AssignBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { schemeId, userIds } = parsed.data;

  // Tenant isolation: every target user must be in the caller's tenant (a WLP
  // only touches its own retailers; a native admin only native users). Applied
  // to BOTH assign and unassign so a tenant can't clear another's assignments.
  const scope = await tenantUserWhere(admin);
  const inScope = await prisma.user.findMany({
    where: { AND: [{ id: { in: userIds } }, scope] },
    select: { id: true, role: true },
  });
  if (inScope.length !== userIds.length) {
    return NextResponse.json(
      { error: "One or more selected users are outside your network." },
      { status: 403 }
    );
  }

  if (schemeId) {
    // The scheme must belong to the caller's own namespace.
    const scheme = await prisma.scheme.findFirst({
      where: { id: schemeId, ...schemeNamespaceWhere(admin) },
      select: { active: true },
    });
    if (!scheme) return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    if (!scheme.active) return NextResponse.json({ error: "Cannot assign an inactive scheme" }, { status: 400 });

    // Verify all target users are network users (non-admin roles).
    const ASSIGNABLE_ROLES = ["SUPER_DISTRIBUTOR", "MASTER_DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"];
    const invalid = inScope.filter((u) => !ASSIGNABLE_ROLES.includes(u.role));
    if (invalid.length > 0) {
      return NextResponse.json(
        {
          error: `Schemes can only be assigned to network users (SD, MD, DT, RT). ${invalid.length} of the selected user(s) have an admin/unsupported role.`,
        },
        { status: 400 }
      );
    }
  }

  const result = await prisma.user.updateMany({
    where: { AND: [{ id: { in: userIds } }, scope] },
    data: { schemeId },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: schemeId ? "scheme.assign" : "scheme.unassign",
      entity: "Scheme",
      entityId: schemeId ?? undefined,
      meta: { schemeId, userCount: result.count, userIds },
    },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
