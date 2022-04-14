import { History } from '../entity/History';
import { getRepository } from 'typeorm';
import { logger } from '../domain/Logger';
import { User } from '../entity/User';

async function addHistoryDao(history) {
    let historyRepository = getRepository(History);
    return await historyRepository.save(history);
}

async function getHistoryByIdDao(historyId: string) {
    let historyRepository = getRepository(History);
    let history = await historyRepository.findOne({
        where: {
            id: historyId
        },
        loadRelationIds: true
    });
    return history;
}

async function deleteHistoryByIdDao(historyId: string) {
    let historyRepository = getRepository(History);
    let history = await historyRepository.delete(historyId);
    return history;
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

async function getHistoryCountDao(where) {
    let historyRepository = getRepository(History);
    let daoResponse = await historyRepository.count({
        where: where
    });
    return daoResponse;
}

async function deleteUserHistoryDao(user: User) {
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

async function getRandomHistoryDao(user: User, limit: number, type: string) {
    let result = [];

    if (type == null) {
        result = await getRepository(History)
            .createQueryBuilder('history')
            .where('history.savedBy = :user', { user: user.id })
            .orderBy('RANDOM()')
            .limit(limit)
            .getMany();
    } else {
        result = await getRepository(History)
            .createQueryBuilder('history')
            .where('history.savedBy = :user and history.type = :type', { user: user.id, type: type })
            .orderBy('RANDOM()')
            .limit(limit)
            .getMany();
    }

    return result;
}

export {
    addHistoryDao,
    getHistoryDao,
    deleteHistoryByIdDao,
    deleteUserHistoryDao,
    getHistoryWithPkDao,
    getHistoryCountDao,
    getRandomHistoryDao,
    getHistoryByIdDao
};
