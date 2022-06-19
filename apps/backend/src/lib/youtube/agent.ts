import logger from '../logger';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './constants';
import { createLogHistoryForUser, updateUserPreference } from '../db';

const prisma = new PrismaClient();

export const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);

export async function performYoutubeSyncForUser(user, fetchAll = false) {
    logger.info({ user: user.username }, 'Performing YouTube Sync for User');

    let toReturn = {
        recentlyPlayed: {
            fetched: 0,
            saved: 0,
            skipped: 0
        }
    };

    try {
        oauth2Client.setCredentials(user.preferences['youtube']['tokens']);

        const client = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        let pageToken = null;
        let fetchMore = true;

        while (fetchMore) {
            let playlistItems = await client.playlistItems.list({
                playlistId: 'LL',
                part: ['snippet'],
                maxResults: 50,
                pageToken: pageToken
            });
            logger.info({ playlistItems: playlistItems, user: user.username }, 'Got Youtube Liked Videos');

            for (let item of playlistItems.data.items) {
                try {
                    await insertToHistory(user, item);
                    await toReturn.recentlyPlayed.saved++;
                } catch (error) {
                    logger.error({ error, user }, 'Error in performYoutubeSyncForUser.insertToHistory');
                    toReturn.recentlyPlayed.skipped++;
                }
            }

            if (!fetchAll) {
                fetchMore = false;
                continue;
            }

            if (playlistItems?.data?.nextPageToken) {
                logger.info(
                    { pageToken: playlistItems.data.nextPageToken, user: user.username },
                    'Got Next Page Token'
                );
                pageToken = playlistItems.data.nextPageToken;
            } else {
                fetchMore = false;
            }
        }

        await updateUserPreference(user, 'youtube', {
            lastSync: new Date().getTime()
        });

        await createLogHistoryForUser(user, 'info', 'YouTube Sync Successful', {});
    } catch (error) {
        logger.error({ error, user }, 'Caught Error in performYoutubeSyncForUser');
        await createLogHistoryForUser(user, 'error', 'Youtube Sync Failed', { error: error.message });
        throw error;
    }

    return toReturn;
}

function insertToHistory(user, item) {
    return prisma.history.create({
        data: {
            userId: user.id,
            type: 'youtube/liked',
            timelineTime: item.snippet.publishedAt,
            contentId: item.id,
            content: {
                title: item.snippet.title,
                author: item.snippet.videoOwnerChannelTitle,
                thumbnail: item.snippet.thumbnails.default.url,
                url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
            }
        }
    });
}
