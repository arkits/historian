import { CircularProgress } from '@mui/material';
import { ContainerPage } from './ContainerPage';

export function Loading() {
    return (
        <>
            <ContainerPage>
                <CircularProgress size={60} />
                <br />
                <br />
                <h2>Loading...</h2>
            </ContainerPage>
        </>
    );
}
