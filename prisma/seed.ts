import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create owner user
  const ownerEmail = process.env.OWNER_EMAIL || 'owner@shepgate.local';
  const ownerPassword = process.env.OWNER_PASSWORD || 'shepgate-dev-password';

  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (existingUser) {
    console.log(`Owner user already exists: ${ownerEmail}`);
  } else {
    const passwordHash = await argon2.hash(ownerPassword);

    const user = await prisma.user.create({
      data: {
        email: ownerEmail,
        passwordHash,
      },
    });

    console.log(`Created owner user: ${user.email}`);
  }

  // Create default agent profile
  const defaultAgent = await prisma.agentProfile.findFirst({
    where: { name: 'Default Agent' },
  });

  if (!defaultAgent) {
    await prisma.agentProfile.create({
      data: {
        name: 'Default Agent',
        description: 'Default agent profile for development',
        hostType: 'claude-desktop',
      },
    });
    console.log('Created default agent profile');
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
