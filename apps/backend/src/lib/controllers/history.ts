import { NextFunction, Request, Response } from 'express';
import { deleteHistory, getHistoryById, getUserHistory, getUserHistoryById as dbGetUserHistoryById } from '../db';
import logger from '../logger';

export async function addHistory(request, response: Response, next: NextFunction) {
    try {
        const session = request['betterAuthSession'];
        if (!session?.user) {
            return next({ message: 'User not found', code: 401 });
        }
    } catch (error) {
        logger.error(error, 'Failed to Add History!');
    }
}

export async function getHistory(request, response: Response, next: NextFunction) {
    try {
        const session = request['betterAuthSession'];
        if (!session?.user) {
            return next({ message: 'User not found', code: 401 });
        }

        const user = session.user;

        const DEFAULT_MAX_RESULTS = 100;

        let limit = request.query.limit ? parseInt(request.query.limit) : DEFAULT_MAX_RESULTS;
        if (limit > DEFAULT_MAX_RESULTS) {
            limit = DEFAULT_MAX_RESULTS;
        }

        let search = request.query.search ? request.query.search : '';

        let type = request.query.type ? request.query.type : '';

        let skip = request.query.skip ? parseInt(request.query.skip) : 0;

        let cursor = request.query.cursor ? request.query.cursor : null;

        let details = request.query.details ? request.query.details : false;

        try {
            logger.info({ user: user.email, limit, skip, cursor, search, type }, 'Getting History');
            let history = await getUserHistory(user, limit, skip, cursor, search, type);
            let filteredHistory = [];

            if (!details) {
                filteredHistory = history.map((h) => {
                    return {
                        id: h.id,
                        type: h.type,
                        createdAt: h.createdAt,
                        contentId: h.contentId,
                        content: h.content,
                        timelineTime: h.timelineTime
                    };
                });
            } else {
                filteredHistory = history.map((h) => h);
            }

            const data = {
                history: filteredHistory,
                limit: limit,
                skip: skip,
                nextCursor: history.length === limit ? history[history.length - 1].id : null
            };

            response.status(200);
            response.json(data);
        } catch (error) {
            logger.error(error, 'Caught Error in Get History!');
            response.status(200);
            response.json({
                history: [],
                nextCursor: null
            });
        }
    } catch (error) {
        logger.error(error, 'Failed to Get History!');
        return next({ message: 'Failed to Get History', code: 500, description: error.message });
    }
}

export async function deleteUserHistory(request, response, next) {
    try {
        const session = request['betterAuthSession'];
        if (!session?.user) {
            return next({ message: 'User not found', code: 401 });
        }

        const user = session.user;

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

export async function getUserHistoryById(request, response: Response, next: NextFunction) {
    try {
        const session = request['betterAuthSession'];
        if (!session?.user) {
            return next({ message: 'User not found', code: 401 });
        }

        const user = session.user;

        const id = request.params.id;
        if (!id) {
            return next({ message: 'ID required', code: 400 });
        }

        const history = await dbGetUserHistoryById(user, id);
        if (!history) {
            return next({ message: 'History not found', code: 404 });
        }

        response.status(200);
        response.json(history);
    } catch (error) {
        logger.error(error, 'Failed to getUserHistoryById!');
    }
}
