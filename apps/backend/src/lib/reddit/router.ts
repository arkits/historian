import { AuthorizationCode } from 'simple-oauth2';
import { response, Router } from 'express';
import logger from '../logger';
import { Prisma, PrismaClient } from '@prisma/client';
import { performRedditSyncForUser } from './agent';
import { updateUserPreference, getUserPreferences } from '../db';
import { auth } from '../auth';
import { fromNodeHeaders } from 'better-auth/node';

const prisma = new PrismaClient();

export const redditRouter = Router();

// Create OAuth2 client directly with proper User-Agent header
const oauth2Client = new AuthorizationCode({
    client: {
        id: process.env.REDDIT_APP_ID,
        secret: process.env.REDDIT_APP_SECRET
    },
    auth: {
        authorizeHost: 'https://www.reddit.com',
        authorizePath: '/api/v1/authorize',
        tokenHost: 'https://www.reddit.com',
        tokenPath: '/api/v1/access_token'
    },
    http: {
        headers: {
            'User-Agent': '@arkits/historian'
        }
    }
});

const redditOAuthConfig = {
    redirect_uri: process.env.REDDIT_APP_CALLBACK_URL,
    state: 'random-unique-string',
    scope: 'identity save history read',
    duration: 'permanent'
};

redditRouter.post('/api/agent/reddit/collect', async (req, res, next) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    if (session?.user) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id
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
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    if (session?.user) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id
                },
                include: {
                    accounts: true
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            try {
                const redditPrefs = getUserPreferences(user, 'reddit');

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
redditRouter.get('/auth/reddit', (req, res) => {
    const authorizationUri = oauth2Client.authorizeURL(redditOAuthConfig);
    res.redirect(authorizationUri);
});

// Exchange the token for the access token.
redditRouter.get('/auth/reddit/callback', async (req, res, next) => {
    const code = req.query.code;

    if (!code) {
        return next({ message: 'No authorization code provided', code: 400 });
    }

    try {
        const tokenParams = {
            code: code as string,
            redirect_uri: redditOAuthConfig.redirect_uri
        };

        const accessToken = await oauth2Client.getToken(tokenParams);
        req['token'] = oauth2Client.createToken(accessToken.token);
    } catch (error) {
        logger.error({ error }, 'Error exchanging code for token');
        return next({ message: 'Failed to exchange authorization code', code: 400, description: error.message });
    }

    // Continue with existing logic
    // Get session using Better Auth
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    logger.info({ token: req['token'], session: session }, 'Completed Reddit OAuth flow');

    if (session?.user) {
        try {
            let user = await prisma.user.findFirst({
                where: {
                    id: session.user.id
                },
                include: {
                    accounts: true
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            user = await updateUserPreference(user, 'reddit', {
                accessToken: req['token']
            });

            logger.info(
                { user: user.email },
                'Completed OAuth flow. Performing initial sync - performRedditSyncForUser'
            );

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
