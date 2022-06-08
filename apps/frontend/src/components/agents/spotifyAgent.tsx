import { Button, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { FONT_LOGO } from '../../constants';
import { getSpotifyAgentCollect, getSpotifyAgentDetails, getSpotifyLoginUrl } from '../../fetch';
import Link from '../../Link';
import { AgentDetails, ConnectionTest } from './shared';

export const SpotifyAgent = () => {
    // State
    const [isManuallyCollecting, setIsManuallyCollecting] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState({} as any);

    // Queries
    const query = useQuery('spotifyAgentDetails', async () => {
        return await getSpotifyAgentDetails().then((res) => res.json());
    });

    return (
        <>
            <Typography variant="h2" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                Spotify
            </Typography>
            <AgentDetails queryData={query?.data} />
            <Button
                variant="contained"
                component={Link}
                noLinkStyle
                href={getSpotifyLoginUrl()}
                target={'_blank'}
                sx={{ mb: 2 }}
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

            <br />

            <Divider />
        </>
    );
};
