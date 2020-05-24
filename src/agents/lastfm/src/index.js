const { logger } = require('./domain/logger');
const config = require('config');
const { createRecentTrackStream } = require('./domain/lastfm');

(async () => {
    logger.info('Historian - LastFM Agent');
    logger.debug('Running with config - ', config.util.toObject());

    createRecentTrackStream();
})();
