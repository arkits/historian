import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { router } from './routes';
import * as bunyan from 'bunyan';
import * as config from 'config';

var logger = bunyan.createLogger({ name: 'historian' });

createConnection()
    .then(async (connection) => {
        // create express app
        const app = express();
        app.use(bodyParser.json());

        app.use('/', router);

        let runOnPort: number = config.get('runOnPort');

        // start express server
        app.listen(runOnPort, () => {
            logger.info(`🕵🏻‍♂️  Historian is running on ${runOnPort} 🙏`);
        });
    })
    .catch((error) => console.log(error));
