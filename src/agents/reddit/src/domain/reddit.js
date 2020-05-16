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
    // let allSavedContent = await savedContent.fetchAll();

    return savedContent;
}

module.exports = {
    getRedditSavedContent
};
