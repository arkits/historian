import logger from '../logger';

export default function logRequest(req, res, next) {
    logger.info(`${req.method} ${req.url}`);
    next();
}
