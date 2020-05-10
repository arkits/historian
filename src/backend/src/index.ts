import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { router } from './routes';
import { logger } from './domain/Logger';
import * as config from 'config';
import * as path from 'path';

// create express app
var app = express();

// add those middlewares
app.use(bodyParser.json());

// Serve the static files from the React app
if (config.get('frontend.serve')) {
    let completeFrontendPath = path.join(__dirname, config.get('frontend.location'));
    logger.info('Serving frontend from %s', completeFrontendPath);
    app.use('/historian', express.static(completeFrontendPath));
}

// add them routes
app.use('/', router);

async function createServer() {
    // create connection to database
    await createConnection();

    // define which port to run on
    let runOnPort: number = config.get('runOnPort');

    // start express server
    app.listen(runOnPort, () => {
        logger.info(`🕵🏻‍♂️  Historian is running on ${runOnPort} 🙏`);
    });
}

(async () => {
    await createServer();
})();

export default app;
