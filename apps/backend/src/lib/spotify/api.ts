import axios from 'axios';
import { updateUserPreference, getUserById, getUserPreferences, UserWithAccounts } from '../db';
import logger from '../logger';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_TOKEN_URL } from './constants';

const SPOTIFY_API_BASE = 'https://api.spotify.com';

export function getMe(user: UserWithAccounts) {
    return callSpotify(`${SPOTIFY_API_BASE}/v1/me`, user);
}

export function getRecentlyPlayed(user: UserWithAccounts, after = null) {
    return callSpotify(`${SPOTIFY_API_BASE}/v1/me/player/recently-played`, user, { after: after, limit: 50 });
}

export async function refreshApiCreds(user: UserWithAccounts) {
    const prefs = getUserPreferences(user, 'spotify');
    if (!prefs || !prefs.refreshToken) {
        throw new Error('No Spotify refresh token found');
    }

    let response = await axios.post(
        SPOTIFY_TOKEN_URL,
        new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: prefs.refreshToken
        }),
        {
            headers: {
                Authorization:
                    'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    await updateUserPreference(user, 'spotify', {
        accessToken: response.data?.access_token
    });

    logger.info({ response: response.data }, 'Refreshed Spotify API Credentials');

    return getUserById(user.id);
}

function callSpotify(url, user: UserWithAccounts, params = {}) {
    const prefs = getUserPreferences(user, 'spotify');
    if (!prefs || !prefs.accessToken) {
        throw new Error('No Spotify access token found');
    }

    return axios.get(url, {
        params: params,
        headers: {
            Authorization: `Bearer ${prefs.accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });
}
