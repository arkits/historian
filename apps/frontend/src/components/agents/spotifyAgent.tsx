import { Button, Divider, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FONT_LOGO } from '../../constants';
import { getSpotifyAgentCollect, getSpotifyAgentDetails, getSpotifyLoginUrl } from '../../fetch';
import Link from '../../Link';
import { AgentDetails, ConnectionTest } from './shared';

export const SpotifyAgent = () => {
    // State
    const [isManuallyCollecting, setIsManuallyCollecting] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState({} as any);

    // Queries
    const query = useQuery({
        queryKey: ['spotifyAgentDetails'],
        queryFn: async () => {
            return await getSpotifyAgentDetails().then((res) => res.json());
        }
    });

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h2" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                    Spotify
                </Typography>
                <AgentDetails queryData={query?.data} />
                <Divider sx={{ my: 1 }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                <Button
                    variant="contained"
                    component={Link}
                    noLinkStyle
                    href={getSpotifyLoginUrl()}
                    target={'_blank'}
                    aria-label="Connect to Spotify"
                >
                    Connect to Spotify
                </Button>

                <ConnectionTest
                    getAgentCollect={getSpotifyAgentCollect}
                    isManuallyCollecting={isManuallyCollecting}
                    setIsManuallyCollecting={setIsManuallyCollecting}
                    connectionTestResult={connectionTestResult}
                    setConnectionTestResult={setConnectionTestResult}
                />
            </Box>
        </Box>
    );
};
