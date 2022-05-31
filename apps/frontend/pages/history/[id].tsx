import { Button, ButtonGroup, Container, Grid, Typography } from '@mui/material';
import HistorianContext from 'apps/frontend/context/historian';
import { Loading } from 'apps/frontend/src/components/Loading';
import { prettyDate } from 'apps/frontend/src/dateFormat';
import { deleteHistoryById, getHistoryById } from 'apps/frontend/src/fetch';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import Link from 'apps/frontend/src/Link';
import { useRouter } from 'next/router';
import { useEffect, useContext, useState } from 'react';
import { useQuery } from 'react-query';

const History = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user, setUser } = useContext(HistorianContext);
    useEffect(() => {
        isUserLoggedIn(router, setUser);
    }, []);

    const historyQuery = useQuery(['history', id], async () => {
        return await getHistoryById(id).then((res) => res.json());
    });

    const [showDetails, setShowDetails] = useState(false);

    const { setSnackbarDetails } = useContext(HistorianContext);

    const ContentImage = () => {
        if (historyQuery?.data?.content?.thumbnail === 'self') {
            return <></>;
        }

        return <img style={{ maxWidth: '100%' }} src={historyQuery.data?.content?.content_url} loading="lazy" />;
    };

    if (historyQuery.isLoading) {
        return <Loading />;
    }

    return (
        <Container maxWidth="lg" sx={{ marginTop: 5 }}>
            <Grid container>
                <Grid item xs={6} md={6}>
                    <Typography variant="overline" display="div" sx={{ lineHeight: '0' }}>
                        ID: {historyQuery.data?.id} <br />
                        Type: {historyQuery.data?.type}
                    </Typography>
                    <br />
                    <br />
                    <Typography variant="h6" gutterBottom component="div">
                        {historyQuery.data?.content?.title}
                    </Typography>
                    <Typography variant="body2" gutterBottom component="div">
                        Subreddit: {historyQuery.data?.content?.subreddit} <br />
                        Author: {historyQuery.data?.content?.author} <br />
                        Score: {historyQuery?.data?.content?.score} <br />
                    </Typography>
                    <br />
                    <Typography variant="body2" gutterBottom component="div">
                        Posted: {prettyDate(new Date(historyQuery.data?.content?.created_utc * 1000))} <br />
                        Saved to Historian: {prettyDate(new Date(historyQuery.data?.createdAt))}
                    </Typography>
                    <ButtonGroup
                        variant="outlined"
                        aria-label="outlined primary button group"
                        sx={{ marginTop: '2rem' }}
                    >
                        <Button onClick={() => setShowDetails(!showDetails)}>Details</Button>
                        <Button
                            component={Link}
                            noLinkStyle
                            href={'https://www.reddit.com' + historyQuery.data?.content?.permalink || '#'}
                            target={'_blank'}
                        >
                            Permalink
                        </Button>
                        <Button
                            onClick={() => {
                                setSnackbarDetails({
                                    open: true,
                                    message: 'Deleted History'
                                });
                                deleteHistoryById(historyQuery.data?.id)
                                    .then((response) => response.json())
                                    .then((res) => {
                                        console.log('deleted', res);
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                            }}
                        >
                            Delete
                        </Button>
                    </ButtonGroup>
                </Grid>
                <Grid item xs={6} md={6}>
                    <ContentImage />
                </Grid>
            </Grid>

            <br />
            {showDetails && <pre>{JSON.stringify(historyQuery.data, null, 4)}</pre>}
        </Container>
    );
};

export default History;
