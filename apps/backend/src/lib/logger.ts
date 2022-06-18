import pino from 'pino';
import pinoms from 'pino-multi-stream';
import * as fs from 'fs';

const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info';

const streams = [
    { stream: process.stdout },
    { stream: fs.createWriteStream('./historian-backend.log', { flags: 'a' }) }
];

const logger = pino({ level: LOGGER_LEVEL }, pinoms.multistream(streams));

export default logger;
