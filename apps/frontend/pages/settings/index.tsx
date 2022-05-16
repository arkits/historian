import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '../../src/Link';
import HistorianContext from 'apps/frontend/context/historian';
import { getRedditLoginUrl } from '../../src/fetch';
import { useRouter } from 'next/router';

const Settings: NextPage = () => {
    const router = useRouter();

    const [user, setUser] = React.useContext(HistorianContext);

    React.useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user]);

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

                    <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{ fontFamily: 'Playfair Display SC, serif', mt: 4 }}
                    >
                        Reddit
                    </Typography>

                    <Button
                        variant="contained"
                        component={Link}
                        noLinkStyle
                        href={getRedditLoginUrl()}
                        target={'_blank'}
                    >
                        Login with Reddit
                    </Button>
                </Box>
            </Container>
        </>
    );
};

export default Settings;
