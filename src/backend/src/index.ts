import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { router } from './routes';
import { logger } from './domain/Logger';
import * as config from 'config';

// create express app
var app = express();

// add those middlewares
app.use(bodyParser.json());

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
