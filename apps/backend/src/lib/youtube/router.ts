import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { google } from 'googleapis';
import { updateUserPreference, getUserPreferences } from '../db';
import logger from '../logger';
import { oauth2Client, performYoutubeSyncForUser } from './agent';
import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_SCOPES } from './constants';

const prisma = new PrismaClient();

export const youtubeRouter = Router();

youtubeRouter.get('/api/agent/youtube', async function (req, res, next) {
    if (req['session'].loggedIn) {
        const user = await prisma.user.findFirst({
            where: {
                id: req['session'].userId
            },
            include: {
                accounts: true
            }
        });

        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        try {
            const prefs = getUserPreferences(user, 'youtube');

            if (!prefs) {
                return next({ message: 'No YouTube preferences found. Please setup Agent.', code: 400 });
            }

            const historyTotal = await prisma.history.count({
                where: {
                    userId: user.id,
                    type: {
                        startsWith: 'youtube'
                    }
                }
            });

            let response = {
                connected: true,
                lastSync: prefs['lastSync'],
                historyTotal: historyTotal
            };

            res.status(200);
            res.json(response);
        } catch (error) {
            return next({ message: 'No YouTube preferences found. Please setup Agent.', code: 400 });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

youtubeRouter.get('/auth/youtube', function (req, res, next) {
    if (req['session'].loggedIn) {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: GOOGLE_OAUTH_SCOPES
        });
        res.redirect(url);
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

youtubeRouter.get('/auth/youtube/callback', async function (req, res, next) {
    if (req['session'].loggedIn) {
        let code = req.query.code as string;
        if (!code) {
            throw new Error('No code provided');
        }

        const { tokens } = await oauth2Client.getToken(code);
        try {
            let user = await prisma.user.findFirst({
                where: {
                    id: req['session'].userId
                },
                include: {
                    accounts: true
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            logger.info({ tokens, user }, 'Got YouTube Access Token');

            user = await updateUserPreference(user, 'youtube', {
                tokens: tokens
            });

            logger.info(
                { user: user.email },
                'Completed OAuth flow. Performing initial sync - performYoutubeSyncForUser'
            );

            performYoutubeSyncForUser(user);
        } catch (error) {
            return next({ message: 'Failed to save access token', code: 400, description: error.message });
        }

        res.send('YouTube OAuth Flow complete. You can close this window.');
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

youtubeRouter.post('/api/agent/youtube/collect', async (req, res, next) => {
    if (req['session'].loggedIn) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: req['session'].userId
                },
                include: {
                    accounts: true
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            const fetchAll = req.query.fetchAll === 'true';

            let response = null;

            try {
                logger.info({ user, fetchAll }, 'Invoking performYoutubeSyncForUser');
                response = await performYoutubeSyncForUser(user);
            } catch (error) {
                return next({ message: 'Error performYoutubeSyncForUser', code: 500, description: error.message });
            }

            res.status(200);
            res.json({
                message: 'OK',
                details: response
            });
        } catch (error) {
            return next({ message: 'Error performYoutubeSyncForUser', code: 400, description: error.message });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});
