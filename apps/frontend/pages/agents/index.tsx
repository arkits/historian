import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '../../src/Link';
import HistorianContext from 'apps/frontend/context/historian';
import { getRedditCollectUrl, getRedditLoginUrl } from '../../src/fetch';
import { useRouter } from 'next/router';

const Agents: NextPage = () => {
    const router = useRouter();

    const { user } = React.useContext(HistorianContext);

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
                        Agents
                    </Typography>

                    <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{ fontFamily: 'Playfair Display SC, serif' }}
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

                    <br />

                    <Button
                        variant="contained"
                        component={Link}
                        noLinkStyle
                        href={getRedditCollectUrl()}
                        target={'_blank'}
                    >
                        Collect Saves
                    </Button>
                </Box>
            </Container>
        </>
    );
};

export default Agents;
