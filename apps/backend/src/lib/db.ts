import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export function getUserById(userId: string) {
    return prisma.user.findFirst({
        where: {
            id: userId
        }
    });
}

export function getUserHistory(
    user: User,
    take: number,
    skip: number,
    cursor?: string,
    search?: string,
    type?: string
) {
    const defaults = {
        where: {
            userId: user.id
        },
        take: take,
        skip: skip
    };

    if (search !== '') {
        defaults.where['searchContent'] = {
            search: search
        };
    }

    if (type !== '' && type !== 'all') {
        defaults.where['type'] = {
            equals: type
        };
    }

    if (cursor) {
        return prisma.history.findMany({
            ...defaults,
            cursor: {
                id: cursor
            },
            orderBy: [
                {
                    createdAt: 'desc'
                }
            ]
        });
    } else {
        return prisma.history.findMany({
            ...defaults,
            orderBy: [
                {
                    createdAt: 'desc'
                }
            ]
        });
    }
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

export function getUserHistoryById(user, id) {
    return prisma.history.findFirst({
        where: {
            id: id,
            userId: user.id
        }
    });
}
