import * as bunyan from 'bunyan';

var logger = bunyan.createLogger({
    name: 'historian',
    streams: [
        {
            stream: process.stdout
        },
        {
            type: 'rotating-file',
            path: 'logs/historian.log',
            period: '1d'
        }
    ]
});

if (process.env.BUNYAN_OFF) {
    console.log('⚠️  BUNYAN_OFF=true... Logs are not shown 🕵🏻‍♂️');
    logger.level(bunyan.FATAL + 1);
}

export { logger };
