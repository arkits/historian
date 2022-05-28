import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';

const Settings: NextPage = () => {
    const router = useRouter();

    const { user, setUser } = React.useContext(HistorianContext);

    React.useEffect(() => {
        isUserLoggedIn(router);
    }, []);
    return (
        <>
            <Container maxWidth="sm">
                <Box
                    maxWidth="sm"
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
                        Settings
                    </Typography>

                    <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{ fontFamily: 'Playfair Display SC, serif' }}
                    >
                        General
                    </Typography>
                    <Typography variant="body1" component="p" gutterBottom>
                        ID: {user?.id} <br />
                        Username: {user?.username}
                    </Typography>
                </Box>
            </Container>
        </>
    );
};

export default Settings;
