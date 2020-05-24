const { logger } = require('./logger');
const config = require('config');
var LastFmNode = require('lastfm').LastFmNode;
const historianDomain = require('./historian');

let lastfm = new LastFmNode({
    api_key: config.get('lastfm.apiKey'),
    secret: config.get('lastfm.secret'),
    useragent: 'arkits/0.0.1 Historian'
});

function createRecentTrackStream() {
    let userRecentTrackStream = lastfm.stream(config.get('lastfm.username'));

    userRecentTrackStream.on('nowPlaying', (track) => {
        logger.info('New nowPlaying Track - trackName=%s | artist=%s', track.name, track.artist["#text"]);
        let history = historianDomain.parseTrackToHistory(track);
        historianDomain.postToHistorian(history);
    });

    userRecentTrackStream.on('error', (e) => {
        logger.error('Caught Error in userRecentTrackStream - ', e);
    });

    userRecentTrackStream.start();
}

module.exports = {
    createRecentTrackStream
};
