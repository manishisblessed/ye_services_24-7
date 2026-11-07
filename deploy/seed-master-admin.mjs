/**
 * Production seed — creates only the MASTER_ADMIN account.
 * Safe to re-run (upsert).  Run once after first deploy.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const masterAdminHash = await bcrypt.hash('9090702707', 12);

// email is no longer globally unique (per-tenant identity migration).
async function upsertUserByEmail({ where, update, create }) {
  const existing = await prisma.user.findFirst({
    where: { email: where.email, platformOwnerId: null },
    select: { id: true },
  });
  if (existing) return prisma.user.update({ where: { id: existing.id }, data: update });
  return prisma.user.create({ data: create });
}

const admin = await upsertUserByEmail({
  where:  { email: 'manish@shahworks.com' },
  update: { passwordHash: masterAdminHash, status: 'ACTIVE' },
  create: {
    name:         'Manish Shah',
    email:        'manish@shahworks.com',
    phone:        '+919090702707',
    passwordHash: masterAdminHash,
    role:         'MASTER_ADMIN',
    status:       'ACTIVE',
    shopName:     'BankingPoint24 HQ',
  },
});

// Seed the service catalog (payment service routes)
const { seedServiceRoutes } = await import('./src/lib/services/catalog.js').catch(() => ({ seedServiceRoutes: null }));
if (seedServiceRoutes) {
  await seedServiceRoutes(prisma);
  console.log('✅ Service routes seeded');
}

console.log('\n========================================');
console.log('  MASTER ADMIN CREATED');
console.log('========================================');
console.log('  Email    :', admin.email);
console.log('  Phone    :', admin.phone);
console.log('  Role     :', admin.role);
console.log('  Status   :', admin.status);
console.log('  Password : 9090702707');
console.log('========================================');
console.log('\n  Login at: https://www.bankingpoint-24.com/master-admin');
console.log('  ⚠️  Change your password after first login!\n');

await prisma.$disconnect();
