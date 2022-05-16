import { createContext, useState } from 'react';

const HistorianContext = createContext({});

export const HistorianContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return <HistorianContext.Provider value={[user, setUser]}>{children}</HistorianContext.Provider>;
};

export default HistorianContext;
