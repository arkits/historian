import { NextFunction, Request, Response } from 'express';
import { getUserHistory } from '../db';
import logger from '../logger';
import { getUserFromSession } from './auth';

export async function addHistory(request, response: Response, next: NextFunction) {
    try {
        const user = getUserFromSession(request.session);
        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }
    } catch (error) {
        logger.error(error, 'Failed to logout User!');
    }
}

export async function getHistory(request, response: Response, next: NextFunction) {
    try {
        const user = await getUserFromSession(request.session);
        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        const history = await getUserHistory(user);

        response.status(200);
        response.json(history);
    } catch (error) {
        logger.error(error, 'Failed to logout User!');
    }
}
