import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const admins = await p.user.findMany({
  where: { role: { in: ['MASTER_ADMIN','ADMIN','SUPER_DISTRIBUTOR'] } },
  select: { id: true, name: true, email: true, role: true, status: true }
});

const total = await p.user.count();
const invites = await p.invite.count();

console.log('\n=== DB CHECK ===');
console.log('Total users:', total);
console.log('Total invites:', invites);
console.log('Admin users:', admins.length);
admins.forEach(a => console.log(` └─ [${a.role}] ${a.name} | ${a.email} | ${a.status}`));

if (admins.length === 0) {
  console.log('\n⚠️  NO ADMIN USER FOUND — need to seed one!');
} else {
  console.log('\n✅ Admin accounts ready for onboarding');
}

await p.$disconnect();
