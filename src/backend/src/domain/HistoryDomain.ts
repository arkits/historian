import { logger } from './Logger';
import { History } from '../entity/History';
import { getHistoryWithPkDao } from '../dao/HistoryDao';

async function validateInstagramHistory(history: History) {
    let pk = history.metadata['pk'];
    let result = await getHistoryWithPkDao(pk);
    let numberOfResult = await result.getCount();

    // don't allow multiple save from the same pk
    if (numberOfResult !== 0) {
        throw new Error('instagram_validation failed for pk - ' + pk);
    }

    return;
}

async function validateRedditSavedHistory(history: History) {
    let pk = history.metadata['pk'];
    let result = await getHistoryWithPkDao(pk);
    let numberOfResult = await result.getCount();

    // don't allow multiple save from the same pk
    if (numberOfResult !== 0) {
        throw new Error('reddit_validation failed for pk - ' + pk);
    }

    return;
}

export { validateInstagramHistory, validateRedditSavedHistory };
