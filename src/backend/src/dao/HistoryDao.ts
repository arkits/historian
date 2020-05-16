import { History } from '../entity/History';
import { getRepository } from 'typeorm';
import { logger } from '../domain/Logger';

async function addHistoryDao(history) {
    let historyRepository = getRepository(History);
    return await historyRepository.save(history);
}

async function getHistoryDao(where: object, offset: number, limit: number, order: object) {
    let historyRepository = getRepository(History);
    let history = await historyRepository.find({
        where: where,
        skip: offset,
        take: limit,
        order: order
    });
    return history;
}

async function getHistoryCountDao(user) {
    let historyRepository = getRepository(History);
    let daoResponse = await historyRepository.count({
        where: {
            savedBy: user.id
        }
    });
    return daoResponse;
}

async function deleteUserHistoryDao(user) {
    let historyRepository = getRepository(History);
    let result = await historyRepository.delete({
        savedBy: user
    });
    logger.debug('[delete-user-history] result - ', result);
}

async function getHistoryWithPkDao(historyPk) {
    let historyRepository = getRepository(History);
    let query = historyRepository.createQueryBuilder('history').where(`metadata ->> 'pk' = '${historyPk}'`);
    return query;
}

export { addHistoryDao, getHistoryDao, deleteUserHistoryDao, getHistoryWithPkDao, getHistoryCountDao };
