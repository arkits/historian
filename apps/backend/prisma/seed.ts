import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const arkits = await prisma.user.upsert({
        where: { email: 'arkits@example.com' },
        update: {},
        create: {
            email: 'arkits@example.com',
            name: 'arkits',
            emailVerified: false
        }
    });

    console.log({ arkits });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
