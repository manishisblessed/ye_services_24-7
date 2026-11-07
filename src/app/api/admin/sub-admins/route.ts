import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireRole, AuthError } from "@/lib/auth-server";
import { requireAdminActivity } from "@/lib/security/adminActivity";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/security/audit";
import { tenantOwnerId, isTenantRoot, isPlatformStaff } from "@/lib/security/ownership";

export const fetchCache = "force-no-store";

export const dynamic = "force-dynamic";

const CreateBody = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8),
  // Tab slugs this sub-admin may access. Empty/omitted = full sub-admin menu.
  allowedTabs: z.array(z.string()).optional(),
});

export async function GET(req: Request) {
  let session;
  try {
    session = await requireRole("MASTER_ADMIN", "ADMIN", "WHITELABEL_PARTNER");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    throw e;
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  // Tenant isolation: native staff see native sub-admins (no tenant); a tenant
  // root sees only the sub-admins inside their own company.
  const ownerId = tenantOwnerId(session);
  const where: Record<string, unknown> = {
    role: "SUPPORT",
    deletedAt: null,
    platformOwnerId: isPlatformStaff(session) ? null : ownerId ?? "__no_tenant__",
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }

  const subAdmins = await prisma.user.findMany({
    where: where as any,
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subAdmins });
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAdminActivity(req, {
      action: "sub-admin.create",
      roles: ["MASTER_ADMIN", "ADMIN", "WHITELABEL_PARTNER"],
      entity: "User",
    });
  } catch (e) {
    return toErrorResponse(e);
  }

  // Inside a white-label company, ONLY the tenant root (partner) may mint staff
  // — a tenant ADMIN/SUPPORT cannot create further sub-admins.
  const ownerId = tenantOwnerId(user);
  if (ownerId && !isTenantRoot(user)) {
    return NextResponse.json(
      { error: "Only the platform owner can create sub-admins" },
      { status: 403 }
    );
  }

  const parsed = CreateBody.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, email, phone, password, allowedTabs } = parsed.data;

  // Per-tenant uniqueness — same email/phone may exist in another company.
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { phone }],
      deletedAt: null,
      platformOwnerId: ownerId ?? null,
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email or phone already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const subAdmin = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      role: "SUPPORT",
      status: "ACTIVE",
      parentId: user.id,
      allowedTabs: allowedTabs ?? [],
      // Bind tenant staff to the partner's company (null for native sub-admins).
      ...(ownerId ? { platformOwnerId: ownerId } : {}),
    },
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
      userId: user.id,
      action: "sub-admin.created",
      entity: "User",
      entityId: subAdmin.id,
      meta: { name, email, phone, allowedTabs: allowedTabs ?? [] },
      ip: clientIp(req),
    },
  });

  return NextResponse.json({ ok: true, subAdmin }, { status: 201 });
}
