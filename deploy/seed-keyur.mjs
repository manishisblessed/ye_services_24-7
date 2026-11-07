import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const hash = await bcrypt.hash('Rutva@0587', 12);

// email is no longer globally unique (per-tenant identity migration).
async function upsertUserByEmail({ where, update, create }) {
  const existing = await prisma.user.findFirst({
    where: { email: where.email, platformOwnerId: null },
    select: { id: true },
  });
  if (existing) return prisma.user.update({ where: { id: existing.id }, data: update });
  return prisma.user.create({ data: create });
}

const user = await upsertUserByEmail({
  where:  { email: 'jagupatel028@gmail.com' },
  update: { name: 'Keyur patel', passwordHash: hash, role: 'MASTER_ADMIN', status: 'ACTIVE', phone: '+918866273699' },
  create: {
    name: 'Keyur patel', email: 'jagupatel028@gmail.com',
    phone: '+918866273699', passwordHash: hash,
    role: 'MASTER_ADMIN', status: 'ACTIVE', shopName: 'BankingPoint24',
  },
});

console.log('\n✅ MASTER_ADMIN created');
console.log('   Name    :', user.name);
console.log('   Email   :', user.email);
console.log('   Phone   :', user.phone);
console.log('   Password: Rutva@0587');
console.log('   Login   : https://www.bankingpoint-24.com/master-admin\n');

await prisma.$disconnect();
