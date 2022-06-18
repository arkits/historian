import {
    Avatar,
    Box,
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
import { green, grey } from '@mui/material/colors';
import HistorianContext from 'apps/frontend/context/historian';
import LoadingSpinner from 'apps/frontend/src/components/LoadingSpinner';
import { getHistory } from 'apps/frontend/src/fetch';
import Link from 'apps/frontend/src/Link';
import { useContext } from 'react';
import { useQuery } from 'react-query';

function RecentHistoryList({ histories }) {
    if (!histories) {
        return <></>;
    }

    return (
        <List sx={{ width: '100%' }}>
            {histories
                .map((history) => (
                    <>
                        <ListItemButton component={Link} href={`/history/${history?.id}`}>
                            <ListItem>
                                <Box sx={{ marginRight: '2rem', color: grey['A400'] }}>{`${history?.createdAt.substr(
                                    0,
                                    10
                                )} ${history?.createdAt.substr(11, 8)}`}</Box>
                                <ListItemText primary={history?.content?.message} />
                                <ListItemAvatar>
                                    <Avatar variant="rounded" sx={{ width: 92, height: 92, bgcolor: green[500] }}>
                                        {history?.content?.level.toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                            </ListItem>
                        </ListItemButton>
                    </>
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

export default function RecentLogs() {
    const { user, setUser } = useContext(HistorianContext);

    const historyQuerySystem = useQuery('dashboardHistory_system', async () => {
        return await getHistory('', 10, '', 'log').then((res) => res.json());
    });

    if (historyQuerySystem.isLoading) {
        return <LoadingSpinner />;
    }

    if (historyQuerySystem.isError) {
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
            <Grid item xs={12} sm={12} md={4}>
                <RecentHistoryListCard title={'Recently Saved - YouTube'} histories={historyQuerySystem.data.history} />
            </Grid>
        </>
    );
}
