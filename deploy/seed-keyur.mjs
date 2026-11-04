import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const hash = await bcrypt.hash('Rutva@0587', 12);

const user = await prisma.user.upsert({
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
