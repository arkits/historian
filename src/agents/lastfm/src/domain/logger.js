const bunyan = require('bunyan');

var logger = bunyan.createLogger({
    name: 'lastfm-agent',
    streams: [
        {
            level: 'debug',
            stream: process.stdout
        },
        {
            level: 'debug',
            type: 'rotating-file',
            path: 'logs/lastfm-agent.log',
            period: '1d'
        }
    ]
});

if (process.env.BUNYAN_OFF) {
    console.log('⚠️  BUNYAN_OFF=true... Logs are not shown 🕵🏻‍♂️');
    logger.level(bunyan.FATAL + 1);
}

module.exports = { logger };
