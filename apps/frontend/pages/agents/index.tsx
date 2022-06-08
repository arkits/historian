import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { useContext, useEffect } from 'react';
import { PageTitle } from 'apps/frontend/src/components/PageTitle';
import { RedditAgent } from 'apps/frontend/src/components/agents/redditAgent';
import { SpotifyAgent } from 'apps/frontend/src/components/agents/spotifyAgent';

const Agents: NextPage = () => {
    const router = useRouter();
    const { user, setUser } = useContext(HistorianContext);
    useEffect(() => {
        isUserLoggedIn(router, setUser);
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
                    <PageTitle>Agents</PageTitle>

                    <RedditAgent />

                    <br />
                    <br />

                    <SpotifyAgent />
                </Box>
            </Container>
        </>
    );
};

export default Agents;
