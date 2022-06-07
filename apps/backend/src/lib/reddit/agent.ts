import snoowrap = require('snoowrap');
import logger from '../logger';
import { PrismaClient } from '@prisma/client';
import { getAllUsers } from '../db';

const prisma = new PrismaClient();

export async function performRedditSyncForUser(user, fetchAll = false) {
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

    r.config({
        requestDelay: 1000
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

    logger.info({ user, response, redditUsername }, 'Completed performRedditSyncForUser');

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

function upsertPostToHistory(post, type, user) {
    return prisma.history.upsert({
        where: {
            contentId_userId_type: {
                contentId: post.id,
                userId: user.id,
                type: type
            }
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

function generateSearchContent(post, type, user) {
    let searchContent = '';
    searchContent += ' ' + safeString(post['title']);
    searchContent += ' ' + safeString(post['author']['name']);
    searchContent += ' ' + safeString(post['subreddit']['display_name']);
    searchContent += ' ' + safeString(post['selftext']);
    return searchContent;
}

function safeString(str) {
    if (str) {
        return str;
    } else {
        return '';
    }
}

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
