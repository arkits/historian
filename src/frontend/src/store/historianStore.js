import { observable, decorate } from 'mobx';
import { createContext } from 'react';

class HistorianStore {
    user = {};
    landingPosts = {};
}

decorate(HistorianStore, {
    user: observable,
    landingPosts: observable
});

export const HistorianStoreContext = createContext(new HistorianStore());
