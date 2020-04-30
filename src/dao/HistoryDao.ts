import { History } from '../entity/History';
import { getRepository } from 'typeorm';
import { logger } from '../domain/Logger';

async function addHistoryDao(history) {
    let historyRepository = getRepository(History);
    await historyRepository.save(history);
}

async function getHistoryDao(where: object, limit: number, order: object) {
    let historyRepository = getRepository(History);
    let history = await historyRepository.find({
        where: where,
        take: limit,
        order: order
    });
    return history;
}

export { addHistoryDao, getHistoryDao };
