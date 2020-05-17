import { observable, decorate } from 'mobx';
import { createContext } from 'react';

class HistorianStore {
    user = {};
}

decorate(HistorianStore, {
    user: observable
});

export const HistorianStoreContext = createContext(new HistorianStore());
