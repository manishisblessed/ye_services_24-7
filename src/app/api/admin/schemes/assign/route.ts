import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminActivity } from "@/lib/security/adminActivity";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { prisma } from "@/lib/db";

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
      roles: ["MASTER_ADMIN", "ADMIN"],
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

  if (schemeId) {
    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
      select: { active: true },
    });
    if (!scheme) return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    if (!scheme.active) return NextResponse.json({ error: "Cannot assign an inactive scheme" }, { status: 400 });

    // Verify all target users exist and are network users (non-admin roles).
    const ASSIGNABLE_ROLES = ["SUPER_DISTRIBUTOR", "MASTER_DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"];
    const targets = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, role: true },
    });
    const invalid = targets.filter((u) => !ASSIGNABLE_ROLES.includes(u.role));
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
    where: { id: { in: userIds } },
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
