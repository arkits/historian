import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as config from 'config';
import * as path from 'path';
import * as cors from 'cors';

import { router } from './routes';
import { logger } from './domain/Logger';
import { historianMetricsMiddleware } from './domain/Metrics';

// create express app
var app = express();

// add those middlewares
app.use(bodyParser.json());

app.use(historianMetricsMiddleware);

// serve frontend via backend
if (config.get('frontend.serve')) {
    let completeFrontendPath = path.join(__dirname, config.get('frontend.location'));
    logger.info('Serving frontend from %s', completeFrontendPath);
    app.use('/historian', express.static(completeFrontendPath));
}

// allow cors
app.use(cors());

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
