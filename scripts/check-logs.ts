import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.actionLog.findMany();
  console.log(`ActionLogs in DB: ${logs.length}`);
  logs.forEach(l => console.log(`  - ${l.status} | ${l.resultSummary}`));

  const pending = await prisma.pendingAction.findMany();
  console.log(`\nPendingActions in DB: ${pending.length}`);
  pending.forEach(p => console.log(`  - ${p.status} | ${p.id}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
