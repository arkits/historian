import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const arkits = await prisma.user.upsert({
        where: { username: 'arkits' },
        update: {},
        create: {
            username: 'arkits',
            passwordHash: '$argon2i$v=19$m=16,t=2,p=1$SElTVE9SSUFOX1NBTFRfMTIz$QQ8PO+yGpcS01/RQ6Qp8AQ'
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
