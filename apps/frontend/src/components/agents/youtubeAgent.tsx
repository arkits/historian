import { Button, Divider, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FONT_LOGO } from '../../constants';
import { getYoutubeAgentCollect, getYoutubeAgentDetails, getYoutubeLoginUrl } from '../../fetch';
import Link from '../../Link';
import { AgentDetails, ConnectionTest } from './shared';

export const YoutubeAgent = () => {
    // State
    const [isManuallyCollecting, setIsManuallyCollecting] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState({} as any);

    // Queries
    const query = useQuery({
        queryKey: ['youtubeAgentDetails'],
        queryFn: async () => {
            return await getYoutubeAgentDetails().then((res) => res.json());
        }
    });

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h2" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                    YouTube
                </Typography>
                <AgentDetails queryData={query?.data} />
                <Divider sx={{ my: 1 }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                <Button
                    variant="contained"
                    component={Link}
                    noLinkStyle
                    href={getYoutubeLoginUrl()}
                    target={'_blank'}
                    aria-label="Connect to YouTube"
                >
                    Connect to YouTube
                </Button>

                <ConnectionTest
                    getAgentCollect={getYoutubeAgentCollect}
                    isManuallyCollecting={isManuallyCollecting}
                    setIsManuallyCollecting={setIsManuallyCollecting}
                    connectionTestResult={connectionTestResult}
                    setConnectionTestResult={setConnectionTestResult}
                />
            </Box>
        </Box>
    );
};
