import { baseUrl, oauthBaseUrl } from './constants';

export const defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');

export function getRedditLoginUrl() {
    return `${oauthBaseUrl}/auth/reddit`;
}

export function getSpotifyLoginUrl() {
    return `${oauthBaseUrl}/auth/spotify`;
}

export function userLogout() {
    return fetch(`${baseUrl}/user/logout`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function userLogin(username: string, password: string) {
    return fetch(`${baseUrl}/user/login`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
}

export function userRegister(username: string, password: string) {
    return fetch(`${baseUrl}/user/signup`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
}

export function getUser() {
    return fetch(`${baseUrl}/user`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function getHistory(cursor: string, limit: number, searchTerm = '', historyType = '') {
    return fetch(`${baseUrl}/history?cursor=${cursor}&limit=${limit}&search=${searchTerm}&type=${historyType}`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function getRedditAgentDetails() {
    return fetch(`${baseUrl}/agent/reddit`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function getRedditAgentCollect() {
    return fetch(`${baseUrl}/agent/reddit/collect`, {
        method: 'POST',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function getSpotifyAgentDetails() {
    return fetch(`${baseUrl}/agent/spotify`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function getSpotifyAgentCollect() {
    return fetch(`${baseUrl}/agent/spotify/collect`, {
        method: 'POST',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function getDashboardData() {
    return fetch(`${baseUrl}/ui/dashboard`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function getHistoryById(id) {
    return fetch(`${baseUrl}/history/${id}`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function deleteHistoryById(id) {
    return fetch(`${baseUrl}/history/${id}`, {
        method: 'DELETE',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}
