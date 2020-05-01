import { Request, Response } from 'express';
import * as config from 'config';
import { logger } from '../domain/Logger';

const version = config.get('version');

function getVersion(request: Request, response: Response) {
    logger.info('[get-version] Returning - ', version);
    response.status(200);
    response.json(version);
    return;
}

export { getVersion };
