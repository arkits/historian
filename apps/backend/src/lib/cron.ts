import { getAllUsers } from './db';
import logger from './logger';
import { performRedditSyncForUser } from './reddit/agent';
import { performSpotifySyncForUser } from './spotify/agent';

export async function performSystemSync() {
    logger.info('Begin performSystemSync');

    try {
        const allUsers = await getAllUsers();
        for (let user of allUsers) {
            performSystemSyncForUser(user)
                .then(() => {
                    {
                        logger.info({ user: user.username }, 'Performed System Sync for User');
                    }
                })
                .catch((error) => {
                    {
                        logger.error({ error, user: user.username }, 'Uncaught error in performSystemSyncForUser');
                    }
                });
        }
    } catch (error) {
        logger.error(error, 'Caught Error in performSystemSync');
    }
}

export async function performSystemSyncForUser(user) {
    try {
        logger.info({ user }, 'Invoking performRedditSyncForUser');
        await performRedditSyncForUser(user, true);
    } catch (error) {
        logger.error(error, user, 'Caught Error in performRedditSyncForUser');
    }

    try {
        logger.info({ user }, 'Invoking performSpotifySyncForUser');
        await performSpotifySyncForUser(user);
    } catch (error) {
        logger.error(error, user, 'Caught Error in performSpotifySyncForUser');
    }
}
