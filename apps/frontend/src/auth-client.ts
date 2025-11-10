import { createAuthClient } from 'better-auth/react';

// Dynamically set API URL based on environment
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const apiBaseUrl = isLocalhost ? 'http://localhost:3333' : 'https://historian-api.archit.xyz';

export const authClient = createAuthClient({
    baseURL: apiBaseUrl
});

export const {
    signIn,
    signUp,
    signOut,
    useSession
} = authClient;
