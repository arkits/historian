import { Request, Response } from 'express';
import { History } from '../entity/History';
import { decodeAuthHeader } from '../utils';
import { getUserByUsername } from '../dao/UserDao';
import { addHistoryDao, getHistoryDao } from '../dao/HistoryDao';
import { logger } from '../domain/Logger';

async function addToHistory(request: Request, response: Response) {
    let [username, _] = decodeAuthHeader(request.headers.authorization);
    let user = await getUserByUsername(username);

    let history = new History();

    history.timestamp = new Date();
    history.raw = {};
    history.type = 'instagram_saved';
    history.savedBy = user;

    try {
        logger.info('[addToHistory] Adding to History - ', history);

        await addHistoryDao(history);

        response.status(200);
        response.json({
            message: 'Added History!'
        });
        return;
    } catch (error) {
        logger.error('[addToHistory] Caught Error - ', error);
        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: 'Bad Request!'
        });
        return;
    }
}

async function getHistory(request: Request, response: Response) {
    let [username, _] = decodeAuthHeader(request.headers.authorization);

    let requestParams = request.query;
    logger.info('[getHistory] Request from username=%s requestParams=%s', username, requestParams);

    let parsedParams = {};

    try {
        // Validate limit
        if (requestParams.hasOwnProperty('limit')) {
            if (1 < Number(requestParams.limit) && Number(requestParams.limit) < 100) {
                parsedParams['limit'] = Number(requestParams.limit);
            } else {
                throw new Error('Limit can only be between 0 and 100.');
            }
        } else {
            parsedParams['limit'] = 10;
        }

        // Validate order
        if (requestParams.hasOwnProperty('order')) {
            if (['ASC', 'DESC'].includes(String(requestParams.order))) {
                parsedParams['order'] = String(requestParams.order);
            } else {
                throw new Error('Order can only be DESC and ASC');
            }
        } else {
            parsedParams['order'] = 'DESC';
        }

        // Validate type
        if (requestParams.hasOwnProperty('type')) {
            if (['instagram_saved', 'web_history'].includes(String(requestParams.type))) {
                parsedParams['type'] = String(requestParams.type);
            } else {
                throw new Error('Invalid type - ' + requestParams.type);
            }
        } else {
            parsedParams['type'] = 'instagram_saved';
        }
    } catch (error) {
        logger.error('[getHistory] Parsing threw an error - ', error);
        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: error.message
        });
        return;
    }

    try {
        let user = await getUserByUsername(username);
        let history = await getHistoryDao(
            {
                savedBy: user.id
            },
            parsedParams['limit'],
            {
                timestamp: parsedParams['order']
            }
        );
        logger.info('[getHistory] Retrived History - ', history);

        response.status(200);
        response.json(history);
        return;
    } catch (error) {
        logger.error('[getHistory] Caught Error - ', error);
        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: 'Bad Request!'
        });
        return;
    }
}

export { addToHistory, getHistory };
