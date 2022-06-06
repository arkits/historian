import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '../../src/Link';
import HistorianContext from 'apps/frontend/context/historian';
import { getRedditAgentCollect, getRedditAgentDetails, getRedditLoginUrl } from '../../src/fetch';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { formatDistance } from 'date-fns';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { useContext, useEffect, useState } from 'react';
import { FONT_LOGO } from 'apps/frontend/src/constants';
import { PageTitle } from 'apps/frontend/src/components/PageTitle';
import { Divider } from '@mui/material';
import { prettyDate } from 'apps/frontend/src/dateFormat';
import LoadingButton from '@mui/lab/LoadingButton';

const RedditAgent = () => {
    // Queries
    const query = useQuery('redditAgentDetails', async () => {
        return await getRedditAgentDetails().then((res) => res.json());
    });

    const AgentDetails = () => {
        if (query?.data?.error) {
            return <Box sx={{ mb: 4 }}>{query.data.error}</Box>;
        }

        if (query?.data?.connected) {
            if (query?.data?.redditUsername) {
                return (
                    <Typography variant="body1" component="p" gutterBottom>
                        Reddit Username: /u/{query?.data?.redditUsername} <br />
                        Last Refreshed:{' '}
                        {formatDistance(new Date(query?.data?.lastSync), new Date(), {
                            addSuffix: true
                        })}{' '}
                        // {prettyDate(new Date(query?.data?.lastSync))}
                        <br />
                        <br />
                        Total Saved: {query?.data?.historyTotal} <br />
                        <br />
                    </Typography>
                );
            } else {
                return (
                    <Typography variant="body1" component="p" gutterBottom>
                        Connected, waiting for initial sync
                        <br /> <br />
                    </Typography>
                );
            }
        } else {
            return <></>;
        }
    };

    const [isManuallyCollecting, setIsManuallyCollecting] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState({} as any);

    const manuallyCollect = () => {
        setIsManuallyCollecting(true);
        getRedditAgentCollect()
            .then((res) => res.json())
            .then((response) => {
                setIsManuallyCollecting(false);
                setConnectionTestResult(response);
            })
            .catch((err) => {
                setIsManuallyCollecting(false);
                console.log(err);
            });
    };

    const ConnectionTest = () => {
        return (
            <>
                <LoadingButton
                    onClick={() => manuallyCollect()}
                    loading={isManuallyCollecting}
                    loadingPosition="end"
                    variant="outlined"
                >
                    Test Connection
                </LoadingButton>
                <br />

                {connectionTestResult?.message ? (
                    <>
                        Connection Test Result: {connectionTestResult?.message} <br />
                        Fetched: {connectionTestResult?.details?.savedPosts?.fetched} <br />
                        Saved: {connectionTestResult?.details?.savedPosts?.saved} <br />
                        Skipped: {connectionTestResult?.details?.savedPosts?.skipped} <br />
                    </>
                ) : (
                    <></>
                )}
            </>
        );
    };

    return (
        <>
            <Typography variant="h2" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                Reddit
            </Typography>
            <AgentDetails />
            <Button
                variant="contained"
                component={Link}
                noLinkStyle
                href={getRedditLoginUrl()}
                target={'_blank'}
                sx={{ mb: 2 }}
            >
                Login with Reddit
            </Button>

            <ConnectionTest />

            <br />

            <Divider />
        </>
    );
};

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
                </Box>
            </Container>
        </>
    );
};

export default Agents;
