import 'dotenv/config';
import * as express from 'express';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as sessions from 'express-session';

import logger from './lib/logger';
import apiRouter from './lib/apiRouter';
import logRequest from './lib/requestLoggingMiddleware';
import errorHandler from './lib/errorHandlingMiddleware';
import redditOAuthRouter from './lib/reddit';

const ONE_DAY = 1000 * 60 * 60 * 24;

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.use(cookieParser());

app.use(
    sessions({
        name: 'HISTORIAN_SESSION',
        secret: process.env.EXPRESS_SESSION_SECRET,
        saveUninitialized: false,
        resave: true,
        cookie: { path: '/', httpOnly: true, secure: false, maxAge: ONE_DAY }
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

app.use('/', apiRouter);
app.use('/', redditOAuthRouter);

app.use(errorHandler);

const port = process.env.port || 3333;

app.listen(port, () => {
    logger.info('Backend has started!', { port });
});
