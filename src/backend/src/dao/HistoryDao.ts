import { History } from '../entity/History';
import { getRepository } from 'typeorm';
import { logger } from '../domain/Logger';

async function addHistoryDao(history) {
    let historyRepository = getRepository(History);
    return await historyRepository.save(history);
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

async function deleteUserHistoryDao(user) {
    let historyRepository = getRepository(History);
    let result = await historyRepository.delete({
        savedBy: user
    });
    logger.debug('[delete-user-history] result - ', result);
}

async function getHistoryWithInstagramPkDao(instagramPk) {
    let historyRepository = getRepository(History);
    let query = historyRepository.createQueryBuilder('history').where(`metadata ->> 'pk' = '${instagramPk}'`);
    return query;
}

export { addHistoryDao, getHistoryDao, deleteUserHistoryDao, getHistoryWithInstagramPkDao };