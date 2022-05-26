import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import { getHistory } from 'apps/frontend/src/fetch';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import theme from 'apps/frontend/src/theme';
import InstagramIcon from '@mui/icons-material/Instagram';
import RedditIcon from '@mui/icons-material/Reddit';
import DescriptionIcon from '@mui/icons-material/Description';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import CircularProgress from '@mui/material/CircularProgress';

const HistoryDetailsCard = ({ history }) => {
    const getTitle = (history) => {
        return history?.content?.title ?? 'NO TITLE';
    };

    const getSubtitle = (history) => {
        return (
            <>
                <Typography>Subreddit: {history?.content?.subreddit}</Typography>
                <Typography>Author: {history?.content?.author}</Typography>
                <Typography>Created: {new Date(history?.content?.created_utc * 1000).toDateString()}</Typography>
            </>
        );
    };

    const getPrettyAvatar = (history) => {
        if (history?.type === 'instagram') {
            return <InstagramIcon />;
        } else if (history?.type === 'reddit') {
            return <RedditIcon />;
        } else if (history?.type === 'lastfm') {
            return <MusicNoteRoundedIcon />;
        } else {
            return <DescriptionIcon />;
        }
    };

    return (
        <div style={{ marginTop: '1rem' }}>
            <Card sx={{ display: 'flex' }}>
                <Grid container spacing={0} sx={{ flex: '1', maxHeight: theme.spacing(20) }}>
                    <Grid item xs={9}>
                        <CardContent>
                            <Typography variant="body1" color="textPrimary" component="p">
                                {getTitle(history)}
                            </Typography>
                            <CardHeader
                                avatar={<Avatar>{getPrettyAvatar(history)}</Avatar>}
                                subheader={getSubtitle(history)}
                                style={{
                                    paddingLeft: '0',
                                    paddingBottom: '0'
                                }}
                            />
                        </CardContent>
                    </Grid>
                    <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <a href={'/'} target={'_blank'}>
                            <Avatar
                                variant="square"
                                src={history?.content?.thumbnail}
                                style={{ width: theme.spacing(22), height: '100%' }}
                            ></Avatar>
                        </a>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};

const HistoryCards = ({ histories }) => {
    if (!histories || histories.length === 0) {
        return (
            <div style={{ textAlign: 'center' }}>
                <Container maxWidth="sm">
                    <h3>*dust*</h3>
                </Container>
            </div>
        );
    } else {
        return (
            <>
                {histories?.map((history) => (
                    <HistoryDetailsCard key={history.id} history={history} />
                ))}
            </>
        );
    }
};

const Dashboard: NextPage = () => {
    const router = useRouter();
    const { user, setUser } = React.useContext(HistorianContext);

    React.useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user]);

    // Access the client
    const queryClient = useQueryClient();

    // Queries
    const { isLoading, error, data, isFetching } = useQuery('history', async () => {
        return await getHistory().then((res) => res.json());
    });

    if (isLoading || isFetching) {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: '10rem' }}>
                    <Container maxWidth="sm">
                        <CircularProgress size={60} />
                        <br />
                        <br />
                        <h2>Loading...</h2>
                    </Container>
                </div>
            </>
        );
    }

    if (error || !data) {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: '10rem' }}>
                    <Container maxWidth="sm">
                        <h3>Error</h3>
                    </Container>
                </div>
            </>
        );
    }

    return (
        <>
            <Container maxWidth="lg">
                <Box
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
                        sx={{ fontFamily: 'Playfair Display SC, serif', mb: 4, fontWeight: 'bold' }}
                    >
                        Dashboard
                    </Typography>

                    <HistoryCards histories={data} />
                </Box>
            </Container>
        </>
    );
};

export default Dashboard;
