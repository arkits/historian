import LoadingButton from '@mui/lab/LoadingButton';
import { Typography, Box, Button, Divider } from '@mui/material';
import { formatDistance } from 'date-fns';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FONT_LOGO } from '../../constants';
import { prettyDate } from '../../dateFormat';
import { getRedditAgentDetails, getRedditAgentCollect, getRedditLoginUrl } from '../../fetch';
import Link from '../../Link';
import { AgentDetails, ConnectionTest } from './shared';

export const RedditAgent = () => {
    // Queries
    const query = useQuery({
        queryKey: ['redditAgentDetails'],
        queryFn: async () => {
            return await getRedditAgentDetails().then((res) => res.json());
        }
    });

    // State
    const [isManuallyCollecting, setIsManuallyCollecting] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState({} as any);

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h2" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                    Reddit
                </Typography>
                <AgentDetails queryData={query?.data} />
                <Divider sx={{ my: 1 }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                <Button
                    variant="contained"
                    component={Link}
                    noLinkStyle
                    href={getRedditLoginUrl()}
                    target={'_blank'}
                    sx={{ mb: 0 }}
                    aria-label="Connect to Reddit"
                >
                    Connect to Reddit
                </Button>

                <ConnectionTest
                    getAgentCollect={getRedditAgentCollect}
                    isManuallyCollecting={isManuallyCollecting}
                    setIsManuallyCollecting={setIsManuallyCollecting}
                    connectionTestResult={connectionTestResult}
                    setConnectionTestResult={setConnectionTestResult}
                />
            </Box>
        </Box>
    );
};
