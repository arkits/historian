import { getUser } from './fetch';

export function isUserLoggedIn(router, setUser) {
    return getUser()
        .then((response) => response.json())
        .then((result) => {
            if (result?.id) {
                setUser(result);
            } else {
                router.push('/login');
            }
        })
        .catch((error) => {
            router.push('/login');
        });
}
