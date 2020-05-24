const { logger } = require('./logger');
const config = require('config');
const axios = require('axios');

/**
 * Parses the Track content from LastFM into the data model preferred by Historian
 * @param {*} track
 */
function parseTrackToHistory(track) {
    let historyBody = {
        type: 'lastfm_nowplaying',
        metadata: track,
        timestamp: new Date()
    };

    logger.debug('Parsed - ', historyBody);

    return historyBody;
}

/**
 * Post Track to Historian
 */
async function postToHistorian(body) {
    try {
        let updateResponse = await axios.post(
            config.get('historian.url') + config.get('historian.endpoints.addHistory'),
            body,
            {
                headers: {
                    Authorization: createBasicAuthHeader(
                        config.get('historian.creds.username'),
                        config.get('historian.creds.password')
                    )
                }
            }
        );
        logger.info('Posted Track to Historian - ', updateResponse.data);
    } catch (error) {
        logger.error('Caught Error in postTrackToHistorian - ', error);
    }
}

/**
 * Decodes the HTTP Authorization header
 * @param {*} username
 * @param {*} password
 */
function createBasicAuthHeader(username, password) {
    var encodedCreds = Buffer.from(username + ':' + password).toString('base64');
    var basicAuthHeader = 'Basic ' + encodedCreds;
    return basicAuthHeader;
}

module.exports = {
    parseTrackToHistory,
    postToHistorian
};
