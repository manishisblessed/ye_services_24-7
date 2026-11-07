/**
 * Demo accounts seed — idempotent (safe to re-run).
 * Creates full role hierarchy + converts manish@shahworks.com to WHITELABEL_PARTNER.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const demoHash   = await bcrypt.hash('Lion_9090702707', 12);

// email is no longer globally unique (per-tenant identity migration).
// Native accounts (platformOwnerId = null) are matched by email within the native scope.
async function upsertUserByEmail({ where, update, create }) {
  const existing = await prisma.user.findFirst({
    where: { email: where.email, platformOwnerId: null },
    select: { id: true },
  });
  if (existing) return prisma.user.update({ where: { id: existing.id }, data: update });
  return prisma.user.create({ data: create });
}

console.log('\n══════════════════════════════════════════');
console.log('  BankingPoint24 — Demo Accounts Seed');
console.log('══════════════════════════════════════════\n');

// ── 1. MASTER ADMIN ────────────────────────────────────────────────────────
const masterAdmin = await upsertUserByEmail({
  where:  { email: 'support@grandhr.in' },
  update: { name: 'Manish Master', passwordHash: demoHash, role: 'MASTER_ADMIN', status: 'ACTIVE' },
  create: {
    name: 'Manish Master', email: 'support@grandhr.in', phone: '+919000000200',
    passwordHash: demoHash, role: 'MASTER_ADMIN', status: 'ACTIVE',
  },
});
console.log('✅ MASTER_ADMIN     →', masterAdmin.email);

// ── 2. ADMIN ───────────────────────────────────────────────────────────────
const admin = await upsertUserByEmail({
  where:  { email: 'cto@samedaysolution.in' },
  update: { name: 'Manish admin', passwordHash: demoHash, role: 'ADMIN', status: 'ACTIVE' },
  create: {
    name: 'Manish admin', email: 'cto@samedaysolution.in', phone: '+919000000205',
    passwordHash: demoHash, role: 'ADMIN', status: 'ACTIVE',
    parentId: masterAdmin.id,
  },
});
console.log('✅ ADMIN            →', admin.email);

// ── 3. SUPER DISTRIBUTOR ───────────────────────────────────────────────────
const superDist = await upsertUserByEmail({
  where:  { email: 'manishspecial009@outlook.com' },
  update: { name: 'Manish SD', passwordHash: demoHash, role: 'SUPER_DISTRIBUTOR', status: 'ACTIVE' },
  create: {
    name: 'Manish SD', email: 'manishspecial009@outlook.com', phone: '+919000000201',
    passwordHash: demoHash, role: 'SUPER_DISTRIBUTOR', status: 'ACTIVE',
    parentId: masterAdmin.id,
    shopName: 'Manish Super Dist HQ', state: 'Gujarat', pincode: '380001',
  },
});
console.log('✅ SUPER_DISTRIBUTOR →', superDist.email);

// ── 4. MASTER DISTRIBUTOR ──────────────────────────────────────────────────
const masterDist = await upsertUserByEmail({
  where:  { email: 'manishspecial009@gmail.com' },
  update: { name: 'Manish MD', passwordHash: demoHash, role: 'MASTER_DISTRIBUTOR', status: 'ACTIVE' },
  create: {
    name: 'Manish MD', email: 'manishspecial009@gmail.com', phone: '+919000000202',
    passwordHash: demoHash, role: 'MASTER_DISTRIBUTOR', status: 'ACTIVE',
    parentId: superDist.id,
    shopName: 'Manish Master Dist', state: 'Gujarat', pincode: '380001',
  },
});
console.log('✅ MASTER_DISTRIBUTOR→', masterDist.email);

// ── 5. DISTRIBUTOR ─────────────────────────────────────────────────────────
const dist = await upsertUserByEmail({
  where:  { email: 'manishkshah27@outlook.com' },
  update: { name: 'Manish DT', passwordHash: demoHash, role: 'DISTRIBUTOR', status: 'ACTIVE' },
  create: {
    name: 'Manish DT', email: 'manishkshah27@outlook.com', phone: '+919000000203',
    passwordHash: demoHash, role: 'DISTRIBUTOR', status: 'ACTIVE',
    parentId: masterDist.id,
    shopName: 'Manish Distributor', state: 'Gujarat', pincode: '380001',
  },
});
console.log('✅ DISTRIBUTOR      →', dist.email);

// ── 6. RETAILER ────────────────────────────────────────────────────────────
const retailer = await upsertUserByEmail({
  where:  { email: 'manishisspecial@gmail.com' },
  update: { name: 'Manish RT', passwordHash: demoHash, role: 'RETAILER', status: 'ACTIVE' },
  create: {
    name: 'Manish RT', email: 'manishisspecial@gmail.com', phone: '+919000000204',
    passwordHash: demoHash, role: 'RETAILER', status: 'ACTIVE',
    parentId: dist.id,
    shopName: 'Manish Retail Shop', state: 'Gujarat', pincode: '380001',
  },
});
console.log('✅ RETAILER         →', retailer.email);

// ── 7. Convert manish@shahworks.com → WHITELABEL_PARTNER ──────────────────
const whitelabel = await upsertUserByEmail({
  where:  { email: 'manish@shahworks.com' },
  update: {
    name: 'Manish whitelable partner',
    passwordHash: demoHash,
    role: 'WHITELABEL_PARTNER',
    status: 'ACTIVE',
  },
  create: {
    name: 'Manish whitelable partner', email: 'manish@shahworks.com', phone: '+919090702707',
    passwordHash: demoHash, role: 'WHITELABEL_PARTNER', status: 'ACTIVE',
    shopName: 'ShahWorks',
  },
});
console.log('✅ WHITELABEL_PARTNER→', whitelabel.email, '(was MASTER_ADMIN)');

// ── Summary ────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('  HIERARCHY CHAIN');
console.log('══════════════════════════════════════════');
console.log(`  MASTER_ADMIN      ${masterAdmin.name} (${masterAdmin.email})`);
console.log(`    └─ ADMIN        ${admin.name} (${admin.email})`);
console.log(`    └─ SUPER_DIST   ${superDist.name} (${superDist.email})`);
console.log(`         └─ MASTER_DIST ${masterDist.name} (${masterDist.email})`);
console.log(`              └─ DIST   ${dist.name} (${dist.email})`);
console.log(`                   └─ RETAILER ${retailer.name} (${retailer.email})`);
console.log(`  WHITELABEL        ${whitelabel.name} (${whitelabel.email})`);
console.log('\n  Password for ALL accounts: Lion_9090702707');
console.log('  Login: https://www.bankingpoint-24.com/login');
console.log('══════════════════════════════════════════\n');

await prisma.$disconnect();
