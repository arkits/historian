import { NextFunction, Request, Response } from 'express';
import { auth } from '../auth';
import { fromNodeHeaders } from 'better-auth/node';

export async function authUserSignedIn(request: Request, response: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(request.headers)
        });

        if (!session) {
            return next({ message: 'User not logged in', code: 401 });
        }

        // Attach session to request for later use
        request['betterAuthSession'] = session;
        next();
    } catch (error) {
        return next({ message: 'Authentication failed', code: 401 });
    }
}

export async function getUserFromRequest(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(request.headers)
        });

        return session?.user || null;
    } catch (error) {
        return null;
    }
}
