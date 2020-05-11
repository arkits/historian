import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';

export default function ErrorCard(props) {
    if (props.error === null) {
        return null;
    } else {
        return (
            <div>
                <Alert severity="error" style={{ marginTop: '20px', width: '100%' }}>
                    <AlertTitle>{props.error.errorTitle}</AlertTitle>
                    {props.error.errorMessage}
                </Alert>
            </div>
        );
    }
}
