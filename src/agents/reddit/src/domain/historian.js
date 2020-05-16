const { logger } = require('./logger');
const config = require('config');
const axios = require('axios');

/**
 * Parsed the Saved content from Snoowrap into the data model preferred by Historian
 * @param {*} redditSavedContent
 */
function parseRedditSavedContent(redditSavedContent) {
    let histories = [];

    redditSavedContent.forEach((saved) => {
        let parsedMetadata = {
            author: saved.author.name,
            pk: saved.id,
            permalink: saved.permalink,
            subreddit: saved.subreddit.display_name,
            created_utc: saved.created_utc,
            score: saved.score,
            title: saved.title,
            thumbnail: saved.thumbnail,
            content_url: saved.url
        };

        let historyBody = {
            type: 'reddit_saved',
            metadata: parsedMetadata,
            timestamp: new Date(parsedMetadata.created_utc * 1000)
        };

        logger.debug('Parsed - ', historyBody.metadata.pk);

        histories.push(historyBody);
    });

    logger.info('Completed Parsing...');
    return histories;
}

/**
 * Takes care of submitting all the Histories in a staggered fashion.
 * Prevent DDOSing the Backend
 * @param {*} histories 
 */
async function staggeredHistoryInsert(histories) {

    // This controls the length of each staggered submission to Historian
    let chunkSize = config.get('agent.chunkSize');

    for (let i = 0; i < histories.length; i += chunkSize) {

        // Slice the passed Histories into a smaller array
        let slicedHistories = histories.slice(i, i + chunkSize);
        // logger.debug('slicedHistories - ', slicedHistories);

        // Post to Historian
        // We don't need to await for the response of the API call
        axios
            .post(config.get('historian.url') + config.get('historian.endpoints.addHistory'), slicedHistories, {
                headers: {
                    Authorization: createBasicAuthHeader(
                        config.get('historian.creds.username'),
                        config.get('historian.creds.password')
                    )
                }
            })
            .then(function (response) {
                logger.info('Submitted History! response -', response.data);
            })
            .catch(function (error) {
                logger.error('Caught Error - ', error.response.data);
            });

        // Wait for 1 second before submitting the next batch
        logger.info('Waiting...');
        await sleep(1000);
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

/**
 * Util function to halt the code execution for X amount of ms
 * @param {*} ms
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    parseRedditSavedContent,
    staggeredHistoryInsert
};
