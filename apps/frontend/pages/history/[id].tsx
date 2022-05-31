import { Button, ButtonGroup, Container, Typography } from '@mui/material';
import HistorianContext from 'apps/frontend/context/historian';
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

    return (
        <Container maxWidth="lg" sx={{ marginTop: 5 }}>
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
                Posted: {new Date(historyQuery.data?.content?.created_utc * 1000).toUTCString()} <br />
                Saved to Historian: {new Date(historyQuery.data?.createdAt).toUTCString()}
            </Typography>
            <br />
            <ButtonGroup variant="outlined" aria-label="outlined primary button group">
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
            {showDetails && <pre>{JSON.stringify(historyQuery.data, null, 4)}</pre>}
        </Container>
    );
};

export default History;
