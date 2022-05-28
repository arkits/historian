export const defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');

// const baseUrl = process.env.BASE_URL || '/api';
// const oauthBaseUrl = process.env.OAUTH_BASE_URL || 'http://localhost:3333';
const baseUrl = 'https://historian-api.archit.xyz/api';
const oauthBaseUrl = 'https://historian-api.archit.xyz';

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

export function getRedditLoginUrl() {
    return `${oauthBaseUrl}/auth/reddit`;
}

export function getUser() {
    return fetch(`${baseUrl}/user`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export function getHistory(limit) {
    return fetch(`${baseUrl}/history?limit=${limit}`, {
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

export function getDashboardData() {
    return fetch(`${baseUrl}/ui/dashboard`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}
