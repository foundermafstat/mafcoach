const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database setup...');

  try {
    // Создаем запись настроек API с текущими значениями из .env
    const apiSettings = await prisma.apiSettings.upsert({
      where: { name: 'Default Sensay API Settings' },
      update: {
        apiKey: process.env.SENSAY_API_KEY,
        organizationId: process.env.SENSAY_ORG_ID,
        userId: process.env.SENSAY_USER_ID,
        replicaUuid: process.env.SENSAY_REPLICA_UUID,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        name: 'Default Sensay API Settings',
        apiKey: process.env.SENSAY_API_KEY,
        organizationId: process.env.SENSAY_ORG_ID,
        userId: process.env.SENSAY_USER_ID,
        replicaUuid: process.env.SENSAY_REPLICA_UUID,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`API Settings created/updated with ID: ${apiSettings.id}`);
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error during database setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
