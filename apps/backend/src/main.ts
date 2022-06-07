import 'dotenv/config';
import * as express from 'express';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as sessions from 'express-session';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import * as cron from 'node-cron';

import logger from './lib/logger';
import router from './lib/router';
import logRequest from './lib/controllers/requestLogger';
import errorHandler from './lib/controllers/errorHandler';
import redditOAuthRouter from './lib/reddit/router';
import { timeStart, version } from './lib/version';
import * as compression from 'compression';
import { performRedditSync } from './lib/reddit/agent';

const ONE_DAY = 1000 * 60 * 60 * 24;

const prisma = new PrismaClient();

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.use(compression());

app.use(cookieParser());

app.use(
    sessions({
        name: 'HISTORIAN_SESSION',
        secret: process.env.EXPRESS_SESSION_SECRET,
        saveUninitialized: false,
        resave: true,
        cookie: { path: '/', httpOnly: true, secure: false, maxAge: ONE_DAY },
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined
        })
    })
);

// allow cors
app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(logRequest);

app.use('/api', router);
app.use('/', redditOAuthRouter);

app.use(errorHandler);

const port = process.env.port || 3333;

cron.schedule('0 * * * *', function () {
    performRedditSync();
});

app.listen(port, () => {
    logger.info({ port, version, timeStart }, 'historian-backend has started!');
});
