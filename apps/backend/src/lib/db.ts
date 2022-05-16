import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export function getUserById(userId: string) {
    return prisma.user.findFirst({
        where: {
            id: userId
        }
    });
}

export function getUserHistory(user: User) {
    return prisma.history.findMany({
        where: {
            userId: user.id
        }
    });
}
