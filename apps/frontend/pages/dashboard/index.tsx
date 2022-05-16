import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';

const Dashboard: NextPage = () => {
    const router = useRouter();
    const [user, setUser] = React.useContext(HistorianContext);

    React.useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user]);

    return (
        <>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontFamily: 'Playfair Display SC, serif', mb: 4 }}
                    >
                        Dashboard
                    </Typography>
                </Box>
            </Container>
        </>
    );
};

export default Dashboard;
