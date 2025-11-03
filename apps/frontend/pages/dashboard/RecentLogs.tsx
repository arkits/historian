import {
    Avatar,
    Box,
    Container,
    Grid,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Paper
} from '@mui/material';
import { grey, orange, red } from '@mui/material/colors';
import HistorianContext from 'apps/frontend/context/historian';
import LoadingSpinner from 'apps/frontend/src/components/LoadingSpinner';
import { prettyDate } from 'apps/frontend/src/dateFormat';
import { getHistory } from 'apps/frontend/src/fetch';
import Link from 'apps/frontend/src/Link';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

function RecentHistoryList({ histories }) {
    if (!histories) {
        return <></>;
    }

    const getLogLevelColor = (logLevel) => {
        switch (logLevel) {
            case 'info':
                return grey[200];
            case 'warning':
                return orange[600];
            case 'error':
                return red[600];
            default:
                return grey[200];
        }
    };

    return (
        <List sx={{ width: '100%' }}>
            {histories
                .map((history) => (
                    <ListItemButton key={history?.id} component={Link} href={`/history/${history?.id}`}>
                        <Box sx={{ marginRight: '2rem', color: grey['A400'] }}>{`${prettyDate(
                            new Date(history?.createdAt)
                        )}`}</Box>
                        <ListItemText primary={history?.content?.message} />
                        <ListItemAvatar>
                            <Avatar
                                variant="rounded"
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: `${getLogLevelColor(history?.content?.level)}`
                                }}
                            >
                                {history?.content?.level.toUpperCase()}
                            </Avatar>
                        </ListItemAvatar>
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

export default function RecentLogs() {
    const { user, setUser } = useContext(HistorianContext);

    const historyQuerySystem = useQuery({
        queryKey: ['dashboardHistory_system'],
        queryFn: async () => {
            return await getHistory('', 10, '', 'log').then((res) => res.json());
        }
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
            <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <RecentHistoryListCard title={''} histories={historyQuerySystem.data.history} />
            </Grid>
        </>
    );
}
