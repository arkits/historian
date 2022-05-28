import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import HistorianContext from 'apps/frontend/context/historian';
import { Alert } from '@mui/material';

export default function HistorianSnackbar() {
    const { snackbarDetails, setSnackbarDetails } = React.useContext(HistorianContext);

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbarDetails({
            open: false,
            message: ''
        });
    };

    const action = (
        <React.Fragment>
            <IconButton size="small" aria-label="close" color="secondary" onClick={handleClose}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return (
        <div>
            <Snackbar open={snackbarDetails.open} autoHideDuration={6000} onClose={handleClose} action={action}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    {snackbarDetails.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
