var bunyan = require('bunyan');
var axios = require('axios');
var fs = require('fs');

var log = bunyan.createLogger({ name: 'batch-submit' });

const vars = {
    backendUrl: 'http://localhost:4209/api/history/add',
    username: 'arkits',
    password: ''
};

/**
 * Decodes the HTTP Authorization header
 */
function createBasicAuthHeader(username, password) {
    var encodedCreds = Buffer.from(username + ':' + password).toString('base64');
    var basicAuthHeader = 'Basic ' + encodedCreds;
    return basicAuthHeader;
}

(async () => {
    log.info('Reading file...');
    let rawHistory = fs.readFileSync('mini.json');
    rawHistory = JSON.parse(rawHistory);

    log.info('Parsed file! Have %s elements', rawHistory.length);

    let chunkSize = 2;

    for (let i = 0; i < rawHistory.length; i += chunkSize) {
        let chunkRawHistory = rawHistory.slice(i, i + chunkSize);

        let chunkBody = [];

        chunkRawHistory.map((metadata) => {
            chunkBody.push({
                type: 'instagram_saved',
                metadata: metadata,
                timestamp: new Date(metadata['taken_at'] * 1000)
            });
        });

        log.info(chunkBody)

        axios
            .post(vars.backendUrl, chunkBody, {
                headers: {
                    Authorization: createBasicAuthHeader(vars.username, vars.password)
                }
            })
            .then(function (response) {
                log.info('Submitted History! response -', response.data);
            })
            .catch(function (error) {
                log.error('Caught Error - ', error.response.data);
            });
    }
})();
