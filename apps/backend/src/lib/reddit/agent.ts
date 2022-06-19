import snoowrap = require('snoowrap');
import logger from '../logger';
import { PrismaClient } from '@prisma/client';
import { createLogHistoryForUser, updateUserPreference } from '../db';

const prisma = new PrismaClient();

export async function performRedditSyncForUser(user, fetchAll = false) {
    try {
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
            const history = await upsertPostToHistory(post, 'reddit/saved', user);
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
            const history = await upsertPostToHistory(post, 'reddit/upvoted', user);
            logger.debug({ post, history }, 'Saved to History: Reddit Upvoted');
            response.savedPosts.saved++;
        }

        const redditUsername = await r.getMe().name;

        logger.info({ user, response, redditUsername }, 'Completed performRedditSyncForUser');

        await updateUserPreference(user, 'reddit', {
            username: redditUsername,
            lastSync: new Date().getTime()
        });

        await createLogHistoryForUser(user, 'info', 'Reddit Sync Successful', {});

        return response;
    } catch (error) {
        logger.error({ user, error }, 'Error performing Reddit Sync');
        await createLogHistoryForUser(user, 'error', 'Reddit Sync Failed', { error: error.message });
        throw error;
    }
}

async function upsertPostToHistory(post, type, user) {
    let previous = await prisma.history.findFirst({
        where: {
            userId: user.id,
            type: type,
            contentId: post.id
        }
    });

    if (previous) {
        logger.debug({ id: previous.id }, 'Post already exists in History, updating');
        return prisma.history.update({
            where: {
                contentId_userId_type_timelineTime: {
                    contentId: previous.contentId,
                    userId: previous.userId,
                    type: previous.type,
                    timelineTime: previous.timelineTime
                }
            },
            data: {
                content: {
                    pk: post.id,
                    subreddit: post.subreddit_name_prefixed,
                    title: post['title'],
                    author: post.author.name,
                    score: post.score,
                    content_url: post['url'],
                    created_utc: post.created_utc,
                    thumbnail: post['thumbnail'],
                    permalink: 'https://old.reddit.com' + post['permalink'],
                    media_embed: post['media_embed']
                },
                type: type,
                searchContent: generateSearchContent(post, type, user),
                timelineTime: new Date(post.created_utc * 1000)
            }
        });
    } else {
        return prisma.history.create({
            data: {
                type: type,
                contentId: post.id,
                timelineTime: new Date(post.created_utc * 1000),
                content: {
                    pk: post.id,
                    subreddit: post.subreddit_name_prefixed,
                    title: post['title'],
                    author: post.author.name,
                    score: post.score,
                    content_url: post['url'],
                    created_utc: post.created_utc,
                    thumbnail: post['thumbnail'],
                    permalink: 'https://old.reddit.com' + post['permalink'],
                    media_embed: post['media_embed']
                },
                userId: user.id,
                searchContent: generateSearchContent(post, type, user)
            }
        });
    }
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
