import * as simpleOAuth2Reddit from '@jimmycode/simple-oauth2-reddit';
import { Router } from 'express';
import logger from './logger';
import * as snoowrap from 'snoowrap';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let redditOAuthRouter = Router();

const reddit = simpleOAuth2Reddit.create({
    clientId: process.env.REDDIT_APP_ID,
    clientSecret: process.env.REDDIT_APP_SECRET,
    callbackURL: 'http://localhost:3333/auth/reddit/callback',
    state: 'random-unique-string',
    scopes: ['identity', 'history'],
    authorizeOptions: {
        grant_type: 'refresh_token',
        duration: 'permanent'
    }
});

// Ask the user to authorize.
redditOAuthRouter.get('/auth/reddit', reddit.authorize);

// Exchange the token for the access token.
redditOAuthRouter.get('/auth/reddit/callback', reddit.accessToken, async (req, res, next) => {
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

            await prisma.user.update({
                where: {
                    id: req['session'].userId
                },
                data: {
                    preferences: {
                        reddit: {
                            accessToken: req['token']
                        }
                    }
                }
            });
        } catch (error) {
            return next({ message: 'Failed to save access token', code: 400, description: error.message });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }

    res.status(200);
    res.json({ message: 'OK' });
});

export default redditOAuthRouter;
