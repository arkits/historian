import { History } from '../entity/History';
import { getRepository } from 'typeorm';
import { logger } from '../domain/Logger';

async function saveHistory(history) {
    var historyRepository = getRepository(History);
    await historyRepository.save(history);
}

async function getHistoryById(history) {}

async function getHistoryByUser(history) {}

export { saveHistory, getHistoryById, getHistoryByUser };
