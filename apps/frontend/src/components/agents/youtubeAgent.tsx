import { Button, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { FONT_LOGO } from '../../constants';
import { getYoutubeAgentCollect, getYoutubeAgentDetails, getYoutubeLoginUrl } from '../../fetch';
import Link from '../../Link';
import { AgentDetails, ConnectionTest } from './shared';

export const YoutubeAgent = () => {
    // State
    const [isManuallyCollecting, setIsManuallyCollecting] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState({} as any);

    // Queries
    const query = useQuery('youtubeAgentDetails', async () => {
        return await getYoutubeAgentDetails().then((res) => res.json());
    });

    return (
        <>
            <Typography variant="h2" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                YouTube
            </Typography>
            <AgentDetails queryData={query?.data} />
            <Button
                variant="contained"
                component={Link}
                noLinkStyle
                href={getYoutubeLoginUrl()}
                target={'_blank'}
                sx={{ mb: 2 }}
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

            <br />
        </>
    );
};
