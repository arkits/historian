import LoadingButton from '@mui/lab/LoadingButton';
import { Typography, Box, Button, Divider } from '@mui/material';
import { formatDistance } from 'date-fns';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { FONT_LOGO } from '../../constants';
import { prettyDate } from '../../dateFormat';
import { getRedditAgentDetails, getRedditAgentCollect, getRedditLoginUrl } from '../../fetch';
import Link from '../../Link';
import { AgentDetails, ConnectionTest } from './shared';

export const RedditAgent = () => {
    // Queries
    const query = useQuery('redditAgentDetails', async () => {
        return await getRedditAgentDetails().then((res) => res.json());
    });

    // State
    const [isManuallyCollecting, setIsManuallyCollecting] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState({} as any);

    return (
        <>
            <Typography variant="h2" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                Reddit
            </Typography>
            <AgentDetails queryData={query?.data} />

            <Button
                variant="contained"
                component={Link}
                noLinkStyle
                href={getRedditLoginUrl()}
                target={'_blank'}
                sx={{ mb: 2 }}
            >
                Connect to Reddit
            </Button>

            <br />

            <ConnectionTest
                getAgentCollect={getRedditAgentCollect}
                isManuallyCollecting={isManuallyCollecting}
                setIsManuallyCollecting={setIsManuallyCollecting}
                connectionTestResult={connectionTestResult}
                setConnectionTestResult={setConnectionTestResult}
            />
        </>
    );
};
