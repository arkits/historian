import { createAuthClient } from 'better-auth/react';

// Dynamically set API URL based on environment
const isLocalhost = typeof window !== 'undefined' && (() => {
  const hostname = window.location.hostname;
  // Check for localhost, 127.0.0.1, or private network IPs (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
  return hostname === 'localhost' ||
         hostname === '127.0.0.1' ||
         hostname.startsWith('10.') ||
         hostname.startsWith('192.168.') ||
         /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
})();

const apiBaseUrl = isLocalhost ? 'http://localhost:3333/api/auth' : 'https://historian-api.archit.xyz/api/auth';

export const authClient = createAuthClient({
    baseURL: apiBaseUrl
});

export const {
    signIn,
    signUp,
    signOut,
    useSession
} = authClient;
