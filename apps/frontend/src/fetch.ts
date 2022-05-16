const defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');

const baseUrl = 'http://localhost:3333';

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
    return `${baseUrl}/auth/reddit`;
}

function getUser() {
    return fetch(`${baseUrl}/user/logout`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'
    });
}

export { defaultHeaders, userLogin, userLogout, getRedditLoginUrl, getUser };
