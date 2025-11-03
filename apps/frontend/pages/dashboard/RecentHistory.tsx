import {
    Avatar,
    Container,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Paper
} from '@mui/material';
import HistorianContext from 'apps/frontend/context/historian';
import LoadingSpinner from 'apps/frontend/src/components/LoadingSpinner';
import { getHistory } from 'apps/frontend/src/fetch';
import {
    getPrettyAvatar,
    getSubtitleText,
    getSubtitleText2,
    getThumbnail,
    getTitleText
} from 'apps/frontend/src/historyUtils';
import Link from 'apps/frontend/src/Link';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

function RecentHistoryList({ histories }) {
    if (!histories) {
        return <></>;
    }

    return (
        <List sx={{ width: '100%' }}>
            {histories
                .map((history) => (
                        <ListItemButton component={Link} href={`/history/${history?.id}`}>
                            <ListItem alignItems="flex-start">
                                <ListItemText
                                    primary={getTitleText(history)}
                                    secondary={
                                        <>
                                            {getSubtitleText(history)} <br />
                                            {getSubtitleText2(history)}
                                        </>
                                    }
                                />
                                <ListItemAvatar>
                                    <Avatar
                                        variant="rounded"
                                        src={getThumbnail(history)}
                                        sx={{ width: 92, height: 92 }}
                                    ></Avatar>
                                </ListItemAvatar>
                            </ListItem>
                        </ListItemButton>
                ))
                .slice(0, 50)}
        </List>
    );
}

function RecentHistoryListCard({ title, histories }) {
    return (
        <Paper>
            <List subheader={<ListSubheader sx={{ backgroundColor: '#0E3541' }}>{title}</ListSubheader>}>
                <RecentHistoryList histories={histories} />
            </List>
        </Paper>
    );
}

export default function RecentHistory() {
    const { user, setUser } = useContext(HistorianContext);

    const historyQueryReddit = useQuery({
        queryKey: ['dashboardHistory_reddit'],
        queryFn: async () => {
            return await getHistory('', 10, '', 'reddit').then((res) => res.json());
        }
    });

    const historyQuerySpotify = useQuery({
        queryKey: ['dashboardHistory_spotify'],
        queryFn: async () => {
            return await getHistory('', 10, '', 'spotify/recently-played').then((res) => res.json());
        }
    });

    const historyQueryYoutube = useQuery({
        queryKey: ['dashboardHistory_youtube'],
        queryFn: async () => {
            return await getHistory('', 10, '', 'youtube/liked').then((res) => res.json());
        }
    });

    if (historyQueryReddit.isLoading || historyQuerySpotify.isLoading || historyQueryYoutube.isLoading) {
        return <LoadingSpinner />;
    }

    if (historyQueryReddit.isError || historyQuerySpotify.isError || historyQueryYoutube.isError) {
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
            <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <RecentHistoryListCard
                        title={'Recently Saved - Reddit'}
                        histories={historyQueryReddit.data.history}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <RecentHistoryListCard
                        title={'Recently Saved - Spotify'}
                        histories={historyQuerySpotify.data.history}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <RecentHistoryListCard
                        title={'Recently Saved - YouTube'}
                        histories={historyQueryYoutube.data.history}
                    />
                </Grid>
            </Grid>
        </>
    );
}
