import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdminActivity } from "@/lib/security/adminActivity";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/security/audit";
import { bumpTokenVersion } from "@/lib/security/session";
import { generateRandomPassword } from "@/lib/utils";
import { tenantOwnerId, isTenantRoot, isPlatformStaff } from "@/lib/security/ownership";

/**
 * Tenant guard for staff mutations. Returns an error response when `actor` may
 * not manage the `target` staff account, else null. A tenant root may only
 * touch staff inside their own company; a tenant ADMIN may touch none (staff
 * management is partner-only); native platform staff only touch native staff.
 */
function staffTenantGuard(
  actor: { id: string; role: string; platformOwnerId?: string | null; isTenantOwner?: boolean },
  target: { platformOwnerId: string | null }
): NextResponse | null {
  const ownerId = tenantOwnerId(actor);
  if (ownerId) {
    if (!isTenantRoot(actor)) {
      return NextResponse.json({ error: "Only the platform owner can manage staff" }, { status: 403 });
    }
    if (target.platformOwnerId !== ownerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return null;
  }
  // Native platform staff: never manage tenant-scoped staff accounts.
  if (isPlatformStaff(actor) && target.platformOwnerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

const PatchBody = z.object({
  action: z.enum(["suspend", "activate", "update-tabs", "reset-password", "reset-2fa"]),
  allowedTabs: z.array(z.string()).optional(),
}).strict();

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let admin;
  try {
    admin = await requireAdminActivity(req, {
      action: "sub-admin.update",
      roles: ["MASTER_ADMIN", "ADMIN", "WHITELABEL_PARTNER"],
      entity: "User",
      entityId: params.id,
    });
  } catch (e) {
    return toErrorResponse(e);
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true, status: true, name: true, platformOwnerId: true },
  });

  if (!target || target.role !== "SUPPORT") {
    return NextResponse.json({ error: "Sub-admin not found" }, { status: 404 });
  }

  const guard = staffTenantGuard(admin, target);
  if (guard) return guard;

  const parsed = PatchBody.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { action, allowedTabs } = parsed.data;

  if (action === "reset-password") {
    const password = generateRandomPassword(10);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: params.id }, data: { passwordHash } });
    await bumpTokenVersion(params.id, { swallow: true });
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "sub-admin.password_reset",
        entity: "User",
        entityId: params.id,
        meta: { name: target.name },
        ip: clientIp(req),
      },
    });
    // Returned once for out-of-band delivery; never stored in plain text.
    return NextResponse.json({ ok: true, password });
  }

  if (action === "reset-2fa") {
    await prisma.user.update({
      where: { id: params.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
        twoFactorVerifiedAt: null,
      },
    });
    await bumpTokenVersion(params.id, { swallow: true });
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "sub-admin.2fa_reset",
        entity: "User",
        entityId: params.id,
        meta: { name: target.name },
        ip: clientIp(req),
      },
    });
    return NextResponse.json({
      ok: true,
      message: "2FA reset. The sub-admin must set up a new authenticator on next login.",
    });
  }

  let update: Record<string, unknown>;
  if (action === "update-tabs") {
    if (!allowedTabs) {
      return NextResponse.json(
        { error: "allowedTabs required for update-tabs action" },
        { status: 400 }
      );
    }
    update = { allowedTabs };
  } else {
    update = { status: action === "suspend" ? "SUSPENDED" : "ACTIVE" };
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: update as any,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      allowedTabs: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: `sub-admin.${action}`,
      entity: "User",
      entityId: params.id,
      meta: { action, name: target.name, ...(allowedTabs ? { allowedTabs } : {}) },
      ip: clientIp(req),
    },
  });

  // Suspend/activate is a privilege change → invalidate the target's sessions.
  await bumpTokenVersion(params.id, { swallow: true });

  return NextResponse.json({ ok: true, subAdmin: updated });
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let admin;
  try {
    admin = await requireAdminActivity(req, {
      action: "sub-admin.delete",
      roles: ["MASTER_ADMIN", "ADMIN", "WHITELABEL_PARTNER"],
      entity: "User",
      entityId: params.id,
    });
  } catch (e) {
    return toErrorResponse(e);
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true, name: true, platformOwnerId: true },
  });

  if (!target || target.role !== "SUPPORT") {
    return NextResponse.json({ error: "Sub-admin not found" }, { status: 404 });
  }

  const guard = staffTenantGuard(admin, target);
  if (guard) return guard;

  await prisma.user.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), status: "CLOSED" },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "sub-admin.deleted",
      entity: "User",
      entityId: params.id,
      meta: { name: target.name },
      ip: clientIp(req),
    },
  });

  await bumpTokenVersion(params.id, { swallow: true });

  return NextResponse.json({ ok: true });
}
