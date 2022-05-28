import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '../../src/Link';
import HistorianContext from 'apps/frontend/context/historian';
import { getRedditAgentCollect, getRedditAgentDetails, getRedditLoginUrl } from '../../src/fetch';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import { formatDistance } from 'date-fns';

const RedditAgent = () => {
    // Access the client
    const queryClient = useQueryClient();

    // Queries
    const query = useQuery('redditAgentDetails', async () => {
        return await getRedditAgentDetails().then((res) => res.json());
    });

    const AgentDetails = () => {
        if (query?.data?.redditUsername) {
            return (
                <Typography variant="body1" component="p" gutterBottom>
                    Reddit Username: /u/{query?.data?.redditUsername} <br />
                    Last Refreshed:{' '}
                    {formatDistance(new Date(query?.data?.lastSync), new Date(), {
                        addSuffix: true
                    })}{' '}
                    // {query?.data?.lastSync}
                    <br />
                    <br />
                    Total Saved: {query?.data?.historyTotal} <br />
                    <br />
                </Typography>
            );
        } else {
            return <></>;
        }
    };

    const [isManuallyCollecting, setIsManuallyCollecting] = React.useState(false);

    const manuallyCollect = () => {
        setIsManuallyCollecting(true);
        getRedditAgentCollect()
            .then((res) => res.json())
            .then((response) => {
                setIsManuallyCollecting(false);
                // window.location.reload();
            })
            .catch((err) => {
                setIsManuallyCollecting(false);
                console.log(err);
            });
    };

    return (
        <>
            <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ fontFamily: 'Playfair Display SC, serif', fontWeight: 700 }}
            >
                Reddit
            </Typography>
            <br />
            <AgentDetails />
            <Button variant="contained" component={Link} noLinkStyle href={getRedditLoginUrl()} target={'_blank'}>
                Login with Reddit
            </Button>
            <br />
            {isManuallyCollecting ? (
                'Collecting... Please wait!'
            ) : (
                <Button variant="outlined" onClick={() => manuallyCollect()}>
                    Manually Collect
                </Button>
            )}
        </>
    );
};

const Agents: NextPage = () => {
    const router = useRouter();

    const { user } = React.useContext(HistorianContext);

    React.useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user]);

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
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontFamily: 'Playfair Display SC, serif', fontWeight: 700, mb: 4 }}
                    >
                        Agents
                    </Typography>

                    <RedditAgent />
                </Box>
            </Container>
        </>
    );
};

export default Agents;
