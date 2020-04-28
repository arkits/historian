import { History } from '../entity/History';
import * as bunyan from 'bunyan';
import { getRepository } from 'typeorm';

const logger = bunyan.createLogger({ name: 'historian' });

const saveHistory = async (history) => {
    var historyRepository = getRepository(History);
    await historyRepository.save(history);
};

export { saveHistory };
