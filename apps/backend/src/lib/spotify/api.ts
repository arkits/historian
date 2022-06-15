import axios from 'axios';
import { appendUserPreferences, getUserById } from '../db';
import logger from '../logger';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_TOKEN_URL } from './constants';

const SPOTIFY_API_BASE = 'https://api.spotify.com';

export function getMe(user) {
    return callSpotify(`${SPOTIFY_API_BASE}/v1/me`, user);
}

export function getRecentlyPlayed(user, after = null) {
    return callSpotify(`${SPOTIFY_API_BASE}/v1/me/player/recently-played`, user, { after: after, limit: 50 });
}

export async function refreshApiCreds(user) {
    const refreshToken = user.preferences['spotify'].refreshToken;

    let response = await axios.post(
        SPOTIFY_TOKEN_URL,
        new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }),
        {
            headers: {
                Authorization:
                    'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    await appendUserPreferences(user, 'spotify', {
        ...user.preferences['spotify'],
        accessToken: response.data?.access_token
    });

    logger.info({ response: response.data }, 'Refreshed Spotify API Credentials');

    return getUserById(user.id);
}

function callSpotify(url, user, params = {}) {
    return axios.get(url, {
        params: params,
        headers: {
            Authorization: `Bearer ${user.preferences['spotify'].accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });
}
