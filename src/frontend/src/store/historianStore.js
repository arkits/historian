import { observable, decorate } from 'mobx';
import { createContext } from 'react';

class HistorianStore {
    drawerOpen = true;
}

decorate(HistorianStore, {
    drawerOpen: observable
});

export const HistorianStoreContext = createContext(new HistorianStore());
