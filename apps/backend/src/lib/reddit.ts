import * as simpleOAuth2Reddit from '@jimmycode/simple-oauth2-reddit';
import { response, Router } from 'express';
import logger from './logger';
import * as snoowrap from 'snoowrap';
import { PrismaClient } from '@prisma/client';
import { getAllUsers } from './db';

const prisma = new PrismaClient();

let redditRouter = Router();

const redditOAuth2Client = simpleOAuth2Reddit.create({
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

export async function performRedditSync() {
    try {
        const allUsers = await getAllUsers();
        for (let user of allUsers) {
            await performRedditSyncForUser(user);
        }
    } catch (error) {
        logger.error(error, 'Caught Error in RedditSync');
    }
}

async function performRedditSyncForUser(user) {
    if (!user.preferences['reddit']['accessToken']['token']['access_token']) {
        throw new Error('User has no access token');
    }

    const r = new snoowrap({
        userAgent: '@arkits/historian',
        clientId: process.env.REDDIT_APP_ID,
        clientSecret: process.env.REDDIT_APP_SECRET,
        accessToken: user.preferences['reddit']['accessToken']['token']['access_token'],
        refreshToken: user.preferences['reddit']['accessToken']['token']['refresh_token']
    });

    let response = {
        savedPosts: {
            fetched: 0,
            saved: 0,
            skipped: 0
        }
    };

    const savedPosts = await await r.getMe().getSavedContent();

    response.savedPosts.fetched = savedPosts.length;

    for (let post of savedPosts) {
        const history = await prisma.history.findFirst({
            where: {
                content: {
                    path: ['pk'],
                    equals: post.id
                }
            }
        });

        if (history) {
            logger.info({ history }, 'History already exists');
            response.savedPosts.skipped++;
            continue;
        }

        await prisma.history.create({
            data: {
                type: 'reddit',
                content: {
                    pk: post.id,
                    subreddit: post.subreddit_name_prefixed,
                    title: post['title'],
                    author: post.author.name,
                    score: post.score,
                    content_url: post['url'],
                    created_utc: post.created_utc,
                    thumbnail: post['thumbnail'],
                    permalink: post['permalink']
                },
                userId: user.id
            }
        });

        logger.info({ post }, 'Saved Post');
        response.savedPosts.saved++;
    }

    return response;
}

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

            let response = null;

            try {
                response = await performRedditSyncForUser(user);
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
