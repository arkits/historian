import * as simpleOAuth2Reddit from '@jimmycode/simple-oauth2-reddit';
import { Router } from 'express';
import logger from './logger';
import * as snoowrap from 'snoowrap';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let redditRouter = Router();

const reddit = simpleOAuth2Reddit.create({
    clientId: process.env.REDDIT_APP_ID,
    clientSecret: process.env.REDDIT_APP_SECRET,
    callbackURL: 'http://localhost:3333/auth/reddit/callback',
    state: 'random-unique-string',
    scope: ['identity', 'save', 'history', 'read'],
    authorizeOptions: {
        grant_type: 'refresh_token',
        duration: 'permanent'
    }
});

redditRouter.get('/agent/reddit/collect', async (req, res, next) => {
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

            const r = new snoowrap({
                userAgent: '@arkits/historian',
                clientId: process.env.REDDIT_APP_ID,
                clientSecret: process.env.REDDIT_APP_SECRET,
                accessToken: user.preferences['reddit']['accessToken']['token']['access_token'],
                refreshToken: user.preferences['reddit']['accessToken']['token']['refresh_token']
            });

            r.getMe()
                .getSavedContent()
                .then((saved) => {
                    logger.info(`${saved.length} saved posts found`);
                    saved.forEach(async (post) => {
                        logger.info({ post }, 'Post');

                        const savedPost = await prisma.history.create({
                            data: {
                                type: 'reddit',
                                content: {
                                    subreddit: post.subreddit_name_prefixed,
                                    title: post['title']
                                },
                                userId: user.id
                            }
                        });
                    });
                })
                .catch((error) => {
                    logger.error(error, 'Error getting saved content');
                });

            res.status(200);
            res.json({
                message: 'OK'
            });
        } catch (error) {
            return next({ message: 'Error in collecting Saved', code: 400, description: error.message });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

// Ask the user to authorize.
redditRouter.get('/auth/reddit', reddit.authorize);

// Exchange the token for the access token.
redditRouter.get('/auth/reddit/callback', reddit.accessToken, async (req, res, next) => {
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

export default redditRouter;
