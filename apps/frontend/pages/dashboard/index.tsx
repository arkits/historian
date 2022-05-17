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
                <Grid container spacing={0}>
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
                    <Grid align="right" item xs={3}>
                        <a href={'/'} target={'_blank'}>
                            <Avatar
                                variant="square"
                                src={history?.content?.thumbnail}
                                style={{ width: theme.spacing(18), height: theme.spacing(18) }}
                            ></Avatar>
                        </a>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};

const Dashboard: NextPage = () => {
    const router = useRouter();
    const [user, setUser] = React.useContext(HistorianContext);

    React.useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user]);

    // Access the client
    const queryClient = useQueryClient();

    // Queries
    const query = useQuery('history', async () => {
        return await getHistory().then((res) => res.json());
    });

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
                        sx={{ fontFamily: 'Playfair Display SC, serif', mb: 4 }}
                    >
                        Dashboard
                    </Typography>

                    <Typography variant="h5" component="p" gutterBottom>
                        {query?.data?.length} items
                    </Typography>

                    {query?.data?.map((history) => (
                        <HistoryDetailsCard key={history.id} history={history} />
                    ))}
                </Box>
            </Container>
        </>
    );
};

export default Dashboard;