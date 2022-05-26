import { createContext, useState } from 'react';

interface HistorianContextInterface {
    user: any;
    setUser: (user: any) => void;
}

const HistorianContext = createContext({} as HistorianContextInterface);

export const HistorianContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return <HistorianContext.Provider value={{ user, setUser }}>{children}</HistorianContext.Provider>;
};

export default HistorianContext;
