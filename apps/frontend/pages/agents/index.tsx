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
import { Paper } from '@mui/material';

function AgentCard({ children }: { children: React.ReactNode }) {
    return (
        <Paper
            sx={{
                p: 2,
                width: '100%',
                boxSizing: 'border-box'
            }}
        >
            {children}
        </Paper>
    );
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <AgentCard>
                        <RedditAgent />
                    </AgentCard>

                    <AgentCard>
                        <SpotifyAgent />
                    </AgentCard>

                    <AgentCard>
                        <YoutubeAgent />
                    </AgentCard>
                </Box>
            </Container>
        </>
    );
};

export default Agents;
