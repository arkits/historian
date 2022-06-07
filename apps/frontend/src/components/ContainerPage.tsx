import { CircularProgress, Container } from '@mui/material';

export function ContainerPage({ children }) {
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: '10rem' }}>
                <Container maxWidth="sm">{children}</Container>
            </div>
        </>
    );
}
