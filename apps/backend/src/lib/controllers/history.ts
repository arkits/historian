import { NextFunction, Request, Response } from 'express';
import { deleteHistory, getHistoryById, getUserHistory } from '../db';
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

        const history = await getUserHistory(user, 50);

        response.status(200);
        response.json(history);
    } catch (error) {
        logger.error(error, 'Failed to logout User!');
    }
}

export async function deleteUserHistory(request, response, next) {
    try {
        const user = await getUserFromSession(request.session);
        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        const id = request.params.id;
        if (!id) {
            return next({ message: 'ID required', code: 400 });
        }

        const history = await getHistoryById(id);

        if (!history) {
            return next({ message: 'History not found', code: 404 });
        }

        if (history.userId !== user.id) {
            return next({ message: 'You are not allowed to delete this history', code: 403 });
        }

        await deleteHistory(id);

        response.status(200);
        response.json({ message: 'OK', history: history });
    } catch (error) {
        logger.error(error, 'Failed to Delete History!');
    }
}
