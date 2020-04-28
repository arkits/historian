import { Request, Response } from 'express';
import * as bunyan from 'bunyan';
import { History } from '../entity/History';
import { decodeAuthHeader } from '../utils';
import { getUserByUsername } from '../dao/UserDao';
import { saveHistory } from '../dao/HistoryDao';

const logger = bunyan.createLogger({ name: 'historian' });

const addToHistory = async (request: Request, response: Response) => {
    let [username, _] = decodeAuthHeader(request.headers.authorization);
    let user = await getUserByUsername(username);

    let history = new History();

    history.timestamp = new Date();
    history.raw = {};
    history.type = 'instagram_saved';
    history.savedBy = user;

    try {
        logger.info('[addToHistory] Adding to History - ', history);

        await saveHistory(history);

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
};

export { addToHistory };
