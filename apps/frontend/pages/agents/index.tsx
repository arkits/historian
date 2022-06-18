import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { useContext, useEffect } from 'react';
import { PageTitle } from 'apps/frontend/src/components/FontTypes';
import { RedditAgent } from 'apps/frontend/src/components/agents/redditAgent';
import { SpotifyAgent } from 'apps/frontend/src/components/agents/spotifyAgent';
import { YoutubeAgent } from 'apps/frontend/src/components/agents/youtubeAgent';
import { Grid, Paper } from '@mui/material';

function AgentCard({ children }: { children: React.ReactNode }) {
    return <Paper sx={{ paddingTop: '1rem', paddingLeft: '1.2rem', paddingBottom: '2rem' }}>{children}</Paper>;
}

const Agents: NextPage = () => {
    const router = useRouter();
    const { user, setUser } = useContext(HistorianContext);
    useEffect(() => {
        isUserLoggedIn(router, setUser);
    }, []);

    return (
        <>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <PageTitle>Agents</PageTitle>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <AgentCard>
                            <RedditAgent />
                        </AgentCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <AgentCard>
                            <SpotifyAgent />
                        </AgentCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <AgentCard>
                            <YoutubeAgent />
                        </AgentCard>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default Agents;
