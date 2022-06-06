import pino from 'pino';
import pinoms from 'pino-multi-stream';
import * as fs from 'fs';

const streams = [
    { stream: process.stdout },
    { stream: fs.createWriteStream('./historian-backend.log', { flags: 'a' }) }
];

const logger = pino({ level: 'info' }, pinoms.multistream(streams));

export default logger;
