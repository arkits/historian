import { Request, Response } from 'express';
import { History } from '../entity/History';
import { decodeAuthHeader } from '../utils';
import { getUserByUsername } from '../dao/UserDao';
import { addHistoryDao, getHistoryDao } from '../dao/HistoryDao';
import { logger } from '../domain/Logger';
import { validateInstagramHistory } from '../domain/HistoryDomain';
import { User } from '../entity/User';

async function addToHistory(request: Request, response: Response) {
    let [username, _] = decodeAuthHeader(request.headers.authorization);
    let user = await getUserByUsername(username);
    let incomingHistory = [];

    try {
        if (Array.isArray(request.body)) {
            // handle a multiple History array
            for (let singleHistory of request.body) {
                incomingHistory.push(await validateIncomingHistory(singleHistory, user));
            }
        } else {
            // handle a single History
            logger.info('Single');
            incomingHistory.push(await validateIncomingHistory(request.body, user));
        }
    } catch (error) {
        logger.error('[add-history] caught error in request validation - ', error);
        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: 'Validation Error - ' + error.message
        });
        return;
    }

    try {
        logger.info('[add-history] Adding to History - ', incomingHistory);

        let savedHistory = await addHistoryDao(incomingHistory);

        let savedHistoryIds = [];
        savedHistory.map((history) => {
            savedHistoryIds.push(history.id);
        });

        response.status(200);
        response.json({
            message: 'Added History!',
            result: {
                length: savedHistory.length,
                id: savedHistoryIds
            }
        });
        return;
    } catch (error) {
        logger.error('[add-history] Caught Error - ', error);
        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: 'Bad Request!'
        });
        return;
    }
}

async function validateIncomingHistory(body, user: User) {
    let history = new History();

    if (body.timestamp) {
        history.timestamp = new Date(body.timestamp);
    } else {
        history.timestamp = new Date();
    }

    if (body.metadata) {
        history.metadata = body.metadata;
    } else {
        throw new Error('Required field metadata not provided');
    }

    if (body.type) {
        if (['instagram_saved', 'web_history'].includes(body.type)) {
            history.type = body.type;
        } else {
            throw new Error('Invalid type - ' + body.type);
        }
    } else {
        throw new Error('Required field type not provided');
    }

    if (history.type == 'instagram_saved') {
        await validateInstagramHistory(history);
    }

    history.savedBy = user;

    return history;
}

async function getHistory(request: Request, response: Response) {
    let [username, _] = decodeAuthHeader(request.headers.authorization);

    let requestParams = request.query;
    logger.info('[get-history] Request from username=%s requestParams=%s', username, requestParams);

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
        logger.error('[get-history] Parsing threw an error - ', error);
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
        logger.info('[get-history] Retrived History - ', history);

        response.status(200);
        response.json(history);
        return;
    } catch (error) {
        logger.error('[get-history] Caught Error - ', error);
        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: 'Bad Request!'
        });
        return;
    }
}

export { addToHistory, getHistory };
