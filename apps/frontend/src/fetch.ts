const defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');

const baseUrl = 'https://historian-api.archit.xyz/api';
const oauthBaseUrl = 'https://historian-api.archit.xyz';

function userLogout() {
    return fetch(`${baseUrl}/user/logout`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

function userLogin(username: string, password: string) {
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

function getRedditLoginUrl() {
    return `${oauthBaseUrl}/auth/reddit`;
}

function getRedditCollectUrl() {
    return `${oauthBaseUrl}/agent/reddit/collect`;
}

function getUser() {
    return fetch(`${baseUrl}/user`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

function getHistory() {
    return fetch(`${baseUrl}/history`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export { defaultHeaders, userLogin, userLogout, getRedditLoginUrl, getUser, getRedditCollectUrl, getHistory };
