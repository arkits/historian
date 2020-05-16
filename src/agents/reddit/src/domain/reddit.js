const snoowrap = require('snoowrap');
const config = require('config');
const { logger } = require('./logger');

async function getRedditSavedContent() {
    // Create reddit client
    const redditClient = new snoowrap({
        userAgent: config.get('reddit.userAgent'),
        clientId: config.get('reddit.clientId'),
        clientSecret: config.get('reddit.clientSecret'),
        username: config.get('reddit.username'),
        password: config.get('reddit.password')
    });

    // Get Saved Content
    logger.info('Getting Saved posts from Reddit...');
    let savedContent = await redditClient.getMe().getSavedContent();

    // If running as Dev, just get the first 25 saved posts
    if (process.env.NODE_ENV === 'dev') {
        return savedContent;
    } else {
        let allSavedContent = await savedContent.fetchAll();
        return allSavedContent;
    }
}

module.exports = {
    getRedditSavedContent
};
