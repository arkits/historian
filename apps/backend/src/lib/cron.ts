import { updateUserPreference, getAllUsers, UserWithAccounts } from './db';
import logger from './logger';
import { performRedditSyncForUser } from './reddit/agent';
import { performSpotifySyncForUser } from './spotify/agent';
import { performYoutubeSyncForUser } from './youtube/agent';

export async function performSystemSync() {
    logger.info('Begin performSystemSync');

    try {
        const allUsers = await getAllUsers();
        for (let user of allUsers) {
            performSystemSyncForUser(user)
                .then(async () => {
                    {
                        await updateUserPreference(user, 'system', {
                            lastSync: new Date().getTime()
                        });
                        logger.info({ user: user.email }, 'Completed System Sync for User');
                    }
                })
                .catch((error) => {
                    {
                        logger.error({ error, user: user.email }, 'Uncaught error in performSystemSyncForUser');
                    }
                });
        }
    } catch (error) {
        logger.error(error, 'Caught Error in performSystemSync');
    }
}

export async function performSystemSyncForUser(user: UserWithAccounts) {
    try {
        logger.info({ user }, 'Invoking performRedditSyncForUser');
        await performRedditSyncForUser(user, true);
    } catch (error) {
        logger.error({ error, user }, 'Caught Error in performRedditSyncForUser');
    }

    try {
        logger.info({ user }, 'Invoking performSpotifySyncForUser');
        await performSpotifySyncForUser(user);
    } catch (error) {
        logger.error({ error, user }, 'Caught Error in performSpotifySyncForUser');
    }

    try {
        logger.info({ user }, 'Invoking performYoutubeSyncForUser');
        await performYoutubeSyncForUser(user);
    } catch (error) {
        logger.error({ error, user }, 'Caught Error in performYoutubeSyncForUser');
    }
}
