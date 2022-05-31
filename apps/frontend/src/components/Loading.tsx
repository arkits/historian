import { CircularProgress, Container } from '@mui/material';

export function Loading() {
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: '10rem' }}>
                <Container maxWidth="sm">
                    <CircularProgress size={60} />
                    <br />
                    <br />
                    <h2>Loading...</h2>
                </Container>
            </div>
        </>
    );
}
