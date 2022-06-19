import logger from '../logger';
import { createLogHistoryForUser, updateUserPreference } from '../db';
import { PrismaClient } from '@prisma/client';
import { getMe, getRecentlyPlayed, refreshApiCreds } from './api';

const prisma = new PrismaClient();

function insertToHistory(user, item) {
    return prisma.history.create({
        data: {
            userId: user.id,
            type: 'spotify/recently-played',
            contentId: item.track.id,
            timelineTime: item?.played_at,
            content: {
                permalink: item?.track?.external_urls?.spotify,
                played_at: item?.played_at,
                trackName: item?.track?.name,
                albumName: item?.track?.album?.name,
                artistName: item?.track?.artists?.map((artist) => artist.name).join(', '),
                albumArt: item?.track?.album?.images[0]?.url
            }
        }
    });
}

export async function performSpotifySyncForUser(user) {
    logger.info({ user: user.username }, 'Performing Spotify Sync for User');

    let toReturn = {
        recentlyPlayed: {
            fetched: 0,
            saved: 0,
            skipped: 0
        }
    };

    try {
        user = await refreshApiCreds(user);

        let response = await getMe(user);
        logger.info({ responseData: response.data, user: user.username }, 'Got Spotify User');

        let fetchMore = true;
        let after = user.preferences['spotify'].lastSync;

        while (fetchMore) {
            let recentlyPlayed = await getRecentlyPlayed(user, after);
            logger.info({ responseData: recentlyPlayed.data, user: user.username }, 'Got Recently Played');

            for (let item of recentlyPlayed.data.items) {
                try {
                    await insertToHistory(user, item);
                    await toReturn.recentlyPlayed.saved++;
                } catch (error) {
                    logger.error({ error, user }, 'Error in performSpotifySyncForUser');
                    toReturn.recentlyPlayed.skipped++;
                }
            }

            if (recentlyPlayed.data?.cursors?.after) {
                after = recentlyPlayed.data.cursors.after;
            } else {
                fetchMore = false;
            }
        }

        await updateUserPreference(user, 'spotify', {
            lastSync: new Date().getTime(),
            username: response.data.uri
        });

        await createLogHistoryForUser(user, 'info', 'Spotify Sync Successful', toReturn);
    } catch (error) {
        logger.error({ error, user }, 'Caught Error in performSpotifySyncForUser');
    }

    return toReturn;
}
