import logger from '../logger';
import axios from 'axios';
import { appendUserPreferences, createLogHistoryForUser } from '../db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SPOTIFY_API_BASE = 'https://api.spotify.com';

export async function performSpotifySyncForUser(user) {
    logger.info({ user }, 'Performing Spotify Sync for User');

    let toReturn = {
        recentlyPlayed: {
            saved: 0
        }
    };

    try {
        let response = await callSpotify(`${SPOTIFY_API_BASE}/v1/me/player/recently-played`, user);
        logger.info({ responseData: response.data }, 'Got Spotify Recently Played');

        for (let item of response.data.items) {
            await prisma.history.create({
                data: {
                    userId: user.id,
                    type: 'spotify/recently-played',
                    contentId: `${item.track.id}-${item?.played_at}`,
                    content: {
                        external_urls: item?.track?.external_urls,
                        played_at: item?.played_at,
                        trackName: item?.track?.name,
                        albumName: item?.track?.album?.name,
                        artistName: item?.track?.artists?.map((artist) => artist.name).join(', '),
                        albumArt: item?.track?.album?.images[0]?.url
                    }
                }
            });
            toReturn.recentlyPlayed.saved++;
        }

        response = await callSpotify(`${SPOTIFY_API_BASE}/v1/me`, user);
        logger.info({ responseData: response.data, user }, 'Got Spotify User');

        await appendUserPreferences(user, 'spotify', {
            ...user.preferences['spotify'],
            lastSync: new Date().getTime(),
            username: response.data.uri
        });

        await createLogHistoryForUser(user, 'info', 'Spotify Sync Successful', toReturn);
    } catch (error) {
        logger.error({ error, user }, 'Caught Error in performSpotifySyncForUser');
    }

    return toReturn;
}

function callSpotify(url, user) {
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${user.preferences['spotify'].accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });
}
