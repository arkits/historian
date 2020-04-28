import { Request, Response } from 'express';
import * as config from 'config';
import * as bunyan from 'bunyan';

const logger = bunyan.createLogger({ name: 'historian' });
const version = config.get('version');

const getVersion = (request: Request, response: Response) => {
    logger.info('In getVersion! Returning - ', version);
    response.status(200);
    response.json(version);
    return;
};

export { getVersion };
