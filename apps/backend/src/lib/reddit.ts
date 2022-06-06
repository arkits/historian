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
    callbackURL: process.env.REDDIT_APP_CALLBACK_URL,
    state: 'random-unique-string',
    scope: ['identity', 'save', 'history', 'read'],
    authorizeOptions: {
        grant_type: 'refresh_token',
        duration: 'permanent'
    }
});

export async function performRedditSync() {
    logger.info('Begin performRedditSync');

    try {
        const allUsers = await getAllUsers();
        for (let user of allUsers) {
            try {
                logger.info({ user }, 'Invoking performRedditSyncForUser');
                await performRedditSyncForUser(user, true);
            } catch (error) {
                logger.error(error, user, 'Caught Error in RedditSync for User');
            }
        }
    } catch (error) {
        logger.error(error, 'Caught Error in PerformRedditSync');
    }
}

function generateSearchContent(post, type, user) {
    return `${post['title']} ${post['author']['name']} ${post['url']} ${post['permalink']} ${post['selftext']}`;
}

function upsertPostToHistory(post, type, user) {
    return prisma.history.upsert({
        where: {
            contentId: post.id
        },
        update: {
            content: {
                pk: post.id,
                subreddit: post.subreddit_name_prefixed,
                title: post['title'],
                author: post.author.name,
                score: post.score,
                content_url: post['url'],
                created_utc: post.created_utc,
                thumbnail: post['thumbnail'],
                permalink: post['permalink'],
                media_embed: post['media_embed']
            },
            type: type,
            searchContent: generateSearchContent(post, type, user)
        },
        create: {
            type: type,
            contentId: post.id,
            content: {
                pk: post.id,
                subreddit: post.subreddit_name_prefixed,
                title: post['title'],
                author: post.author.name,
                score: post.score,
                content_url: post['url'],
                created_utc: post.created_utc,
                thumbnail: post['thumbnail'],
                permalink: post['permalink'],
                media_embed: post['media_embed']
            },
            userId: user.id,
            searchContent: generateSearchContent(post, type, user)
        }
    });
}

async function performRedditSyncForUser(user, fetchAll = false) {
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

    // Sync Saved Posts
    let savedPosts = await r.getMe().getSavedContent();
    if (fetchAll) {
        savedPosts = await savedPosts.fetchAll();
    }
    savedPosts.reverse();

    response.savedPosts.fetched += savedPosts.length;

    for (let post of savedPosts) {
        const history = await upsertPostToHistory(post, 'reddit-saved', user);
        logger.debug({ post, history }, 'Saved to History: Reddit Saved');
        response.savedPosts.saved++;
    }

    // Sync Upvoted Posts
    let upvotedPosts = await r.getMe().getUpvotedContent();
    if (fetchAll) {
        upvotedPosts = await upvotedPosts.fetchAll();
    }
    upvotedPosts.reverse();

    response.savedPosts.fetched += upvotedPosts.length;

    for (let post of upvotedPosts) {
        const history = await upsertPostToHistory(post, 'reddit-upvoted', user);
        logger.debug({ post, history }, 'Saved to History: Reddit Upvoted');
        response.savedPosts.saved++;
    }

    const redditUsername = await r.getMe().name;

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            preferences: {
                reddit: {
                    ...user.preferences['reddit'],
                    username: redditUsername,
                    lastSync: new Date().getTime()
                }
            }
        }
    });

    return response;
}

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
                logger.info({ user, fetchAll }, 'Invoking performRedditSyncForUser');
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
                        userId: user.id
                    }
                });

                let response = {
                    connected: true,
                    redditUsername: redditPrefs['username'],
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
    res.send('Reddit OAuth flow completed! Please return to Historian.');
});

export default redditRouter;
