import { observable, decorate } from 'mobx';
import { createContext } from 'react';

class HistorianStore {
    drawerOpen = true;
    user = {};
}

decorate(HistorianStore, {
    drawerOpen: observable,
    user: observable
});

export const HistorianStoreContext = createContext(new HistorianStore());
