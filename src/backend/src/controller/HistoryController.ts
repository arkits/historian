import { Request, Response } from 'express';
import { History } from '../entity/History';
import { decodeAuthHeader } from '../utils';
import { getUserByUsername } from '../dao/UserDao';
import { addHistoryDao, getHistoryDao, getRandomHistoryDao } from '../dao/HistoryDao';
import { logger } from '../domain/Logger';
import { validateInstagramHistory, validateRedditSavedHistory } from '../domain/HistoryDomain';
import { User } from '../entity/User';
import * as config from 'config';

const validHistoryTypes = <string[]>config.get('domain.historyTypes');

async function addToHistory(request: Request, response: Response) {
    // extract username
    let [username, _] = decodeAuthHeader(request.headers.authorization);

    // get User based on extracted username
    let user = await getUserByUsername(username);

    // store received history
    let incomingHistory = [];

    // store any Histories that failed to be saved partially
    let failedHistory = [];

    if (Array.isArray(request.body)) {
        // handle a multiple History array
        for (let singleHistory of request.body) {
            try {
                incomingHistory.push(await validateIncomingHistory(singleHistory, user));
            } catch (error) {
                // if there is any validation error, catch it and continue with the rest
                logger.error('[add-history] caught error in request validation - ', error);
                failedHistory.push(singleHistory);
            }
        }
    } else {
        // handle a single History
        try {
            incomingHistory.push(await validateIncomingHistory(request.body, user));
        } catch (error) {
            // if there is any validation error, throw a 400
            logger.error('[add-history] caught error in request validation - ', error);
            response.status(400);
            response.json({
                error: 'Bad Request!',
                error_description: 'Validation Error - ' + error.message
            });
            return;
        }
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
                saved: savedHistoryIds,
                failed: failedHistory
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
        if (validHistoryTypes.includes(body.type)) {
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

    if (history.type == 'reddit_saved') {
        await validateRedditSavedHistory(history);
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
            if (validHistoryTypes.includes(String(requestParams.type))) {
                parsedParams['type'] = String(requestParams.type);
            } else {
                throw new Error('Invalid type - ' + requestParams.type);
            }
        } else {
            parsedParams['type'] = null;
        }

        // Validate offset
        if (requestParams.hasOwnProperty('offset')) {
            if (!isNaN(Number(requestParams.offset))) {
                parsedParams['offset'] = Number(requestParams.offset);
            } else {
                throw new Error('Invalid offset - ' + requestParams.offset);
            }
        } else {
            parsedParams['offset'] = 0;
        }

        logger.debug('[get-history] parsed params - ', parsedParams);
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

        let where = {
            savedBy: user.id
        };

        if (parsedParams['type'] !== null) {
            where['type'] = parsedParams['type'];
        }

        let history = await getHistoryDao(where, parsedParams['offset'], parsedParams['limit'], {
            timestamp: parsedParams['order']
        });

        logger.info('[get-history] Retrieved History - ', history.length);

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

async function getRandomHistory(request: Request, response: Response) {
    try {
        // get the username
        let [username, _] = decodeAuthHeader(request.headers.authorization);

        let parsedParams = {};

        // get the requestParams
        let requestParams = request.query;
        logger.info('[get-history-random] Request from username=%s requestParams=%s', username, requestParams);

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

            // Validate type
            if (requestParams.hasOwnProperty('type')) {
                if (validHistoryTypes.includes(String(requestParams.type))) {
                    parsedParams['type'] = String(requestParams.type);
                } else {
                    throw new Error('Invalid type - ' + requestParams.type);
                }
            } else {
                parsedParams['type'] = null;
            }
        } catch (error) {
            logger.error('[get-history-random] Parsing threw an error - ', error);
            response.status(400);
            response.json({
                error: 'Bad Request!',
                error_description: error.message
            });
            return;
        }

        // retrieve the user object
        let user = await getUserByUsername(username);

        // retrieve random histories
        let histories = await getRandomHistoryDao(user, parsedParams['limit'], parsedParams['type']);

        // finish the request
        response.status(200);
        response.json(histories);
        return;
    } catch (error) {
        logger.error('[get-history-random] Caught Error - ', error);
        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: 'Bad Request!'
        });
        return;
    }
}

export { addToHistory, getHistory, getRandomHistory };
