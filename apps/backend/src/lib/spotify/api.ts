import axios from 'axios';

const SPOTIFY_API_BASE = 'https://api.spotify.com';

export function getMe(user) {
    return callSpotify(`${SPOTIFY_API_BASE}/v1/me`, user);
}

export function getRecentlyPlayed(user, after = null) {
    return callSpotify(`${SPOTIFY_API_BASE}/v1/me/player/recently-played`, user, { after: after, limit: 50 });
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
