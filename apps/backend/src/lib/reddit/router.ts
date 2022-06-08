import * as simpleOAuth2Reddit from '@jimmycode/simple-oauth2-reddit';
import { response, Router } from 'express';
import logger from '../logger';
import { Prisma, PrismaClient } from '@prisma/client';
import { performRedditSyncForUser } from './agent';
import e = require('express');
import { appendUserPreferences } from '../db';

const prisma = new PrismaClient();

export const redditRouter = Router();

const redditOAuth2Client = simpleOAuth2Reddit.create({
    clientId: process.env.REDDIT_APP_ID,
    clientSecret: process.env.REDDIT_APP_SECRET,
    callbackURL: process.env.REDDIT_APP_CALLBACK_URL,
    state: 'random-unique-string',
    scope: ['identity', 'save', 'history', 'read'],
    authorizeOptions: {
        grant_type: 'refresh_token',
        duration: 'permanent'
    }
});

redditRouter.post('/api/agent/reddit/collect', async (req, res, next) => {
    if (req['session'].loggedIn) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: req['session'].userId
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            const fetchAll = req.query.fetchAll === 'true';

            let response = null;

            try {
                response = await performRedditSyncForUser(user, fetchAll);
            } catch (error) {
                return next({ message: 'Error Performing Reddit Sync', code: 500, description: error.message });
            }

            res.status(200);
            res.json({
                message: 'OK',
                details: response
            });
        } catch (error) {
            return next({ message: 'Error in collecting Saved', code: 400, description: error.message });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

redditRouter.get('/api/agent/reddit', async (req, res, next) => {
    if (req['session'].loggedIn) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: req['session'].userId
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            try {
                const redditPrefs = user.preferences['reddit'];

                if (!redditPrefs) {
                    return next({ message: 'No Reddit preferences found. Please setup Agent.', code: 400 });
                }

                const historyTotal = await prisma.history.count({
                    where: {
                        userId: user.id,
                        type: {
                            startsWith: 'reddit'
                        }
                    }
                });

                let response = {
                    connected: true,
                    username: redditPrefs['username'],
                    lastSync: redditPrefs['lastSync'],
                    historyTotal: historyTotal
                };

                res.status(200);
                res.json(response);
            } catch (error) {
                return next({ message: 'No Reddit preferences found. Please setup Agent.', code: 400 });
            }
        } catch (error) {
            return next({ message: 'Error in /api/agent/reddit', code: 400, description: error.message });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

// Ask the user to authorize.
redditRouter.get('/auth/reddit', redditOAuth2Client.authorize);

// Exchange the token for the access token.
redditRouter.get('/auth/reddit/callback', redditOAuth2Client.accessToken, async (req, res, next) => {
    logger.info({ token: req['token'], session: req['session'] }, 'Completed Reddit OAuth flow');

    if (req['session'].loggedIn) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: req['session'].userId
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            await appendUserPreferences(user, 'reddit', {
                ...user.preferences['reddit'],
                accessToken: req['token']
            });

            // Perform initial sync
            performRedditSyncForUser(user, true);
        } catch (error) {
            return next({ message: 'Failed to save access token', code: 400, description: error.message });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }

    res.status(200);
    res.send('Reddit OAuth flow completed! Please return to Historian.');
});
