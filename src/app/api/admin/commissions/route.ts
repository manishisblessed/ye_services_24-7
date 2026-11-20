import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth-server";
import { requireAdminActivity } from "@/lib/security/adminActivity";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { prisma } from "@/lib/db";
import { isPlatformStaff, tenantOwnerId, getTenantMemberIds, assertCanAccessUser } from "@/lib/security/ownership";

export const fetchCache = "force-no-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await requireRole("MASTER_ADMIN", "ADMIN", "SUPPORT", "WHITELABEL_PARTNER");
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const ownerId = tenantOwnerId(admin);
    const memberIds = ownerId ? await getTenantMemberIds(ownerId) : null;

    const where: Record<string, unknown> = { active: true };
    if (memberIds) where.userId = { in: memberIds };
    if (userId) {
      if (memberIds && !memberIds.includes(userId))
        return NextResponse.json({ slabs: [] });
      where.userId = userId;
    }

    const slabs = await prisma.commissionSlab.findMany({
      where: where as any,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: [{ service: "asc" }, { minAmount: "asc" }],
    });

    const mapped = slabs.map((s) => ({
      id: s.id,
      userId: s.userId,
      userName: s.user.name,
      userRole: s.user.role,
      service: s.service,
      minAmount: Number(s.minAmount),
      maxAmount: Number(s.maxAmount),
      flat: s.flat ? Number(s.flat) : null,
      percent: s.percent ? Number(s.percent) : null,
      active: s.active,
      effectiveFrom: s.effectiveFrom.toISOString(),
      effectiveTo: s.effectiveTo?.toISOString() ?? null,
    }));

    return NextResponse.json({ slabs: mapped });
  } catch (e: any) {
    if (e?.name === "AuthError") return NextResponse.json({ error: e.message }, { status: 401 });
    console.error("[admin/commissions] GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const CreateBody = z.object({
  userId: z.string().min(1),
  service: z.string().min(1),
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  flat: z.number().optional(),
  percent: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdminActivity(req, {
      action: "commission.create",
      roles: ["MASTER_ADMIN", "ADMIN"],
      entity: "CommissionSlab",
    });
    const parsed = CreateBody.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { userId, service, minAmount, maxAmount, flat, percent } = parsed.data;

    try {
      await assertCanAccessUser(userId, admin);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!flat && !percent)
      return NextResponse.json(
        { error: "Either flat or percent is required" },
        { status: 400 }
      );

    const slab = await prisma.commissionSlab.create({
      data: {
        userId,
        service: service as any,
        minAmount,
        maxAmount,
        flat: flat ?? null,
        percent: percent ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "commission.create",
        entity: "CommissionSlab",
        entityId: slab.id,
        meta: parsed.data,
      },
    });

    return NextResponse.json({ ok: true, slab: { ...slab, minAmount: Number(slab.minAmount), maxAmount: Number(slab.maxAmount), flat: slab.flat ? Number(slab.flat) : null, percent: slab.percent ? Number(slab.percent) : null } }, { status: 201 });
  } catch (e) {
    return toErrorResponse(e);
  }
}
