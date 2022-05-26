import { Alert } from '@mui/material';

export const ErrorBanner = ({ error }) => {
    if (!error) {
        return null;
    }

    return (
        <Alert variant="filled" severity="error" sx={{ mt: 5 }}>
            {error}
        </Alert>
    );
};
