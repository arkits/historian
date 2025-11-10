import { authClient } from './auth-client';

export function isUserLoggedIn(router, setUser) {
    // Use Better Auth session
    return authClient.getSession()
        .then((session) => {
            if (session?.data?.user) {
                setUser(session.data.user);
            } else {
                router.push('/login');
            }
        })
        .catch((error) => {
            console.error('Session check failed:', error);
            router.push('/login');
        });
}
