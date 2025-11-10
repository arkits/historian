import { Prisma, PrismaClient, User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TIMELINE_TYPES } from './constants';

const prisma = new PrismaClient();

// Helper type for User with accounts included
export type UserWithAccounts = User & {
    accounts: Array<{
        id: string;
        userId: string;
        accountId: string;
        providerId: string;
        accessToken: string | null;
        refreshToken: string | null;
        accessTokenExpiresAt: Date | null;
        refreshTokenExpiresAt: Date | null;
        scope: string | null;
        idToken: string | null;
        password: string | null;
        metadata: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};

// Helper function to get account preferences for a service
export function getUserPreferences(user: UserWithAccounts, providerId: string): any {
    const account = user.accounts.find(acc => acc.providerId === providerId);
    if (!account) {
        return null;
    }

    const metadata = (account.metadata as Prisma.JsonObject) || {};
    return {
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        ...metadata
    };
}

export function getUserById(userId: string) {
    return prisma.user.findFirst({
        where: {
            id: userId
        },
        include: {
            accounts: true
        }
    });
}

export function getUserAccount(userId: string, providerId: string) {
    return prisma.account.findFirst({
        where: {
            userId: userId,
            providerId: providerId
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
    return prisma.user.findMany({
        include: {
            accounts: true
        }
    });
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

export function getUserActivityCountForDate(user, dateStart: Date, dateEnd: Date, type?: string) {
    const defaults = {
        where: {
            userId: user.id,
            timelineTime: {
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

export async function getOrCreateUserAccount(userId: string, providerId: string) {
    let account = await prisma.account.findFirst({
        where: {
            userId: userId,
            providerId: providerId
        }
    });

    if (!account) {
        account = await prisma.account.create({
            data: {
                userId: userId,
                providerId: providerId,
                accountId: userId,
                metadata: {}
            }
        });
    }

    return account;
}

export async function updateUserPreference(user, key, updatedPreferences) {
    const account = await getOrCreateUserAccount(user.id, key);

    const currentMetadata = (account.metadata as Prisma.JsonObject) || {};

    // Create a copy of updatedPreferences for metadata, excluding fields that go in dedicated columns
    const metadataUpdates = { ...updatedPreferences };

    const updates: any = {};

    // Update OAuth tokens if provided
    // Handle both token objects and plain strings
    if (updatedPreferences.accessToken) {
        // Check if it's a token object (from simple-oauth2 or similar)
        if (typeof updatedPreferences.accessToken === 'object' && updatedPreferences.accessToken.token) {
            // Extract the actual access token string
            updates.accessToken = updatedPreferences.accessToken.token.access_token;
            // Store refresh token if available
            if (updatedPreferences.accessToken.token.refresh_token) {
                updates.refreshToken = updatedPreferences.accessToken.token.refresh_token;
            }
            // Store expiration if available
            if (updatedPreferences.accessToken.token.expires_at) {
                updates.accessTokenExpiresAt = new Date(updatedPreferences.accessToken.token.expires_at);
            }
        } else {
            // Plain string token
            updates.accessToken = updatedPreferences.accessToken;
        }
        // Don't store accessToken in metadata since it's in a dedicated column
        delete metadataUpdates.accessToken;
    }
    if (updatedPreferences.refreshToken && typeof updatedPreferences.refreshToken === 'string') {
        updates.refreshToken = updatedPreferences.refreshToken;
        // Don't store refreshToken in metadata since it's in a dedicated column
        delete metadataUpdates.refreshToken;
    }

    // Update metadata with remaining preferences
    const updatedMetadata = {
        ...currentMetadata,
        ...metadataUpdates
    };
    updates.metadata = updatedMetadata;

    await prisma.account.update({
        where: {
            id: account.id
        },
        data: updates
    });

    return getUserById(user.id);
}

export function appendUserPreferences(user, key, value) {
    return updateUserPreference(user, key, value);
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
