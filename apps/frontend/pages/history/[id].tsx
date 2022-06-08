import { Button, ButtonGroup, Container, Grid, Typography } from '@mui/material';
import HistorianContext from 'apps/frontend/context/historian';
import { ContainerPage } from 'apps/frontend/src/components/ContainerPage';
import { Loading } from 'apps/frontend/src/components/Loading';
import { prettyDate } from 'apps/frontend/src/dateFormat';
import { deleteHistoryById, getHistoryById } from 'apps/frontend/src/fetch';
import { getTitleText } from 'apps/frontend/src/historyUtils';
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

        if (historyQuery?.data?.content?.media_embed?.content) {
            return (
                <div
                    className="content"
                    dangerouslySetInnerHTML={{ __html: historyQuery?.data?.content?.media_embed?.content }}
                ></div>
            );
        }

        if (historyQuery.data?.content?.content_url) {
            return (
                <>
                    <img style={{ maxWidth: '100%' }} src={historyQuery.data?.content?.content_url} loading="lazy" />
                    <Button
                        fullWidth
                        variant="contained"
                        component={Link}
                        noLinkStyle
                        href={historyQuery.data?.content?.content_url || '#undefined'}
                        sx={{ mt: 3, mb: 2 }}
                        target={'_blank'}
                    >
                        Link
                    </Button>
                </>
            );
        }

        if (historyQuery.data?.content?.context) {
            return (
                <>
                    <Typography variant="h5" component="div">
                        Context
                    </Typography>
                    <pre>{JSON.stringify(historyQuery?.data?.content?.context, null, 2)}</pre>
                </>
            );
        }

        return <></>;
    };

    if (historyQuery.isLoading) {
        return <Loading />;
    }

    if (historyQuery.isError || historyQuery.data.error) {
        return (
            <>
                <ContainerPage>Error: {historyQuery?.data?.error}</ContainerPage>
            </>
        );
    }

    const HistoryDetails = ({ history }) => {
        switch (history?.type) {
            case 'log':
                return (
                    <Typography variant="body2" gutterBottom component="div">
                        Level: {history?.content?.level} <br />
                    </Typography>
                );
            case 'reddit-saved':
            case 'reddit-upvoted':
                return (
                    <Typography variant="body2" gutterBottom component="div">
                        Subreddit: {historyQuery.data?.content?.subreddit} <br />
                        Author: {historyQuery.data?.content?.author} <br />
                        Score: {historyQuery?.data?.content?.score} <br />
                    </Typography>
                );
            default:
                return <></>;
        }
    };

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
                        {getTitleText(historyQuery.data)}
                    </Typography>

                    <HistoryDetails history={historyQuery.data} />

                    <Typography variant="body2" gutterBottom component="div">
                        {/* Posted: {prettyDate(new Date(historyQuery.data?.content?.created_utc * 1000))} <br /> */}
                        Saved to Historian: {prettyDate(new Date(historyQuery.data?.createdAt))}
                    </Typography>
                    <ButtonGroup
                        variant="outlined"
                        aria-label="outlined primary button group"
                        sx={{ marginTop: '2rem' }}
                    >
                        <Button onClick={() => setShowDetails(!showDetails)}>Details</Button>
                        {historyQuery.data?.content?.permalink && (
                            <Button
                                component={Link}
                                noLinkStyle
                                href={'https://www.reddit.com' + historyQuery.data?.content?.permalink || '#'}
                                target={'_blank'}
                            >
                                Permalink
                            </Button>
                        )}

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
