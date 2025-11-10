import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import { toNodeHandler } from 'better-auth/node';

import logger from './lib/logger';
import router from './lib/router';
import logRequest from './lib/controllers/requestLogger';
import errorHandler from './lib/controllers/errorHandler';

import { timeStart, version } from './lib/version';
import compression from 'compression';
import { redditRouter } from './lib/reddit/router';
import { spotifyRouter } from './lib/spotify/router';
import { performSystemSync } from './lib/cron';
import { youtubeRouter } from './lib/youtube/router';
import { auth } from './lib/auth';

const app = express();

app.disable('x-powered-by');

app.use(compression());

app.use(cookieParser());

// allow cors - must be before Better Auth handler
app.use(
    cors({
        origin: true,
        credentials: true
    })
);

// Better Auth handler - must be before express.json()
app.all('/api/auth/*', toNodeHandler(auth));

// express.json() must come after Better Auth handler
app.use(express.json());

app.use(logRequest);

app.use('/api', router);
app.use('/', redditRouter);
app.use('/', spotifyRouter);
app.use('/', youtubeRouter);

app.use(errorHandler);

const port = process.env.port || 3333;

cron.schedule('0 * * * *', function () {
    performSystemSync();
});

app.listen(port, () => {
    logger.info({ port, version, timeStart }, 'historian-backend has started!');
});
