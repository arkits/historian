import { createContext, useState } from 'react';

interface HistorianContextInterface {
    user: any;
    setUser: (user: any) => void;
    snackbarDetails: any;
    setSnackbarDetails: (snackbarDetails: any) => void;
}

const HistorianContext = createContext({} as HistorianContextInterface);

export const HistorianContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [snackbarDetails, setSnackbarDetails] = useState({
        open: false,
        message: ''
    });

    return (
        <HistorianContext.Provider value={{ user, setUser, snackbarDetails, setSnackbarDetails }}>
            {children}
        </HistorianContext.Provider>
    );
};

export default HistorianContext;
