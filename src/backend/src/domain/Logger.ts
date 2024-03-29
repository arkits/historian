import * as bunyan from 'bunyan';

var logger = bunyan.createLogger({
    name: 'historian',
    streams: [
        {
            level: 'debug',
            stream: process.stdout
        },
        {
            level: 'debug',
            type: 'rotating-file',
            path: 'logs/historian-backend.log',
            period: '1d'
        }
    ]
});

if (process.env.BUNYAN_OFF) {
    console.log('⚠️  BUNYAN_OFF=true... Logs are not shown 🕵🏻‍♂️');
    logger.level(bunyan.FATAL + 1);
}

export { logger };
