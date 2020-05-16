const { logger } = require('./domain/logger');
const config = require('config');
const redditDomain = require('./domain/reddit');
const historianDomain = require('./domain/historian');

(async () => {
    logger.info('Historian - Reddit Agent');
    logger.debug('Running with config - ', config.util.toObject());

    let redditSavedContent = await redditDomain.getRedditSavedContent();

    let histories = historianDomain.parseRedditSavedContent(redditSavedContent);

    await historianDomain.staggeredHistoryInsert(histories);

    await historianDomain.updateUserMetadata();

    logger.info('Completed Reddit Saves!');
})();
