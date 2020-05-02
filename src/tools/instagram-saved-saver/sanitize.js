var bunyan = require('bunyan');
var fs = require('fs');

var log = bunyan.createLogger({ name: 'sanitize' });

(async () => {
    log.info('Reading file...');
    let rawHistory = fs.readFileSync('archive.json');
    rawHistory = JSON.parse(rawHistory);

    let sanitized = Object.values(rawHistory);

    log.info('Parsed file! Have %s elements', sanitized.length);

    fs.writeFileSync('archive_sanitized.json', JSON.stringify(sanitized, null, 4));
})();