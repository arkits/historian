import { NextFunction, Request, Response } from 'express';
import { getUserById } from '../db';

export function authUserSignedIn(request: Request, response: Response, next: NextFunction) {
    if (!request['session'].loggedIn) {
        return next({ message: 'User not logged in', code: 400 });
    } else {
        next();
    }
}

export function getUserFromSession(session) {
    if (!session) {
        return null;
    }

    if (!session.loggedIn) {
        return null;
    }

    if (session.userId) {
        const user = getUserById(session.userId);
        if (user) {
            return user;
        } else {
            return null;
        }
    }

    return null;
}
