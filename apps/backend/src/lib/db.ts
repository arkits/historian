import { Prisma, PrismaClient, User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TIMELINE_TYPES } from './constants';

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

    if (type === 'reddit') {
        defaults.where['type'] = {
            in: ['reddit/saved', 'reddit/upvoted']
        };
    } else if (type === 'timeline') {
        defaults.where['type'] = {
            in: TIMELINE_TYPES
        };
    } else if (type !== '' && type !== 'all') {
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
                    timelineTime: 'desc'
                }
            ]
        });
    } else {
        return prisma.history.findMany({
            ...defaults,
            orderBy: [
                {
                    timelineTime: 'desc'
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

export function getUserHistoryCountForDate(user, dateStart: Date, dateEnd: Date, type?: string) {
    const defaults = {
        where: {
            userId: user.id,
            createdAt: {
                gte: dateStart,
                lt: dateEnd
            }
        }
    };

    if (type) {
        defaults.where['type'] = {
            equals: type
        };
    }

    return prisma.history.count({
        ...defaults
    });
}

export function updateUserPreference(user, key, updatedPreferences) {
    let up = {};

    if (user.preferences.hasOwnProperty(key)) {
        up = {
            ...user.preferences[key],
            ...updatedPreferences
        };
    } else {
        up = {
            ...updatedPreferences
        };
    }

    return appendUserPreferences(user, key, {
        ...up
    });
}

export function appendUserPreferences(user, key, value) {
    const updatedPreferences = {
        ...(user.preferences as Prisma.JsonObject),
        [key]: value
    };

    return prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            preferences: updatedPreferences
        }
    });
}

export function createLogHistoryForUser(user, level, message, context) {
    return prisma.history.create({
        data: {
            type: 'log',
            userId: user.id,
            content: {
                level: level,
                message: message,
                context: context
            },
            contentId: uuidv4(),
            timelineTime: new Date()
        }
    });
}
