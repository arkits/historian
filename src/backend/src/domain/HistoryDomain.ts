import { logger } from './Logger';
import { History } from '../entity/History';
import { getHistoryWithInstagramPkDao } from '../dao/HistoryDao';

async function validateInstagramHistory(history: History) {
    
    let instagramPk = history.metadata['pk'];
    let result = await getHistoryWithInstagramPkDao(instagramPk);
    let numberOfResult = await result.getCount();

    // don't allow multiple save from the same pk
    if (numberOfResult !== 0) {
        throw new Error('instagram_validation failed for pk - ' + instagramPk);
    }

    return;
}

export { validateInstagramHistory };
