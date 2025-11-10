// Dynamically set API URL based on environment
const isLocalhost =
    typeof window !== 'undefined' &&
    (() => {
        const hostname = window.location.hostname;
        // Check for localhost, 127.0.0.1, or private network IPs (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
        return hostname === 'localhost';
    })();

const apiBaseUrl = isLocalhost ? 'http://localhost:3333' : 'https://historian-api.archit.xyz';

export const baseUrl = `${apiBaseUrl}/api`;
export const oauthBaseUrl = apiBaseUrl;

export const FONT_LOGO = 'Pirata One, cursive';
