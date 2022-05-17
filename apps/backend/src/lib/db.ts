import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export function getUserById(userId: string) {
    return prisma.user.findFirst({
        where: {
            id: userId
        }
    });
}

export function getUserHistory(user: User, take: number) {
    return prisma.history.findMany({
        where: {
            userId: user.id
        },
        take: take
    });
}

export function getAllUsers() {
    return prisma.user.findMany();
}

export function getHistoryById(historyId: string) {
    return prisma.history.findFirst({
        where: {
            id: historyId
        }
    });
}

export function deleteHistory(historyId) {
    return prisma.history.delete({
        where: {
            id: historyId
        }
    });
}
