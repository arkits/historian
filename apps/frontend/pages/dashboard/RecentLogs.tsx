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
    Paper,
    Typography
} from '@mui/material';
import { grey, orange, red } from '@mui/material/colors';
import HistorianContext from 'apps/frontend/context/historian';
import { RecentLogsSkeleton } from 'apps/frontend/src/components/SkeletonLoaders';
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
        // Use dense list to reduce default paddings
        <List dense sx={{ width: '100%' }}>
            {histories
                .map((history) => (
                    <ListItemButton
                        key={history?.id}
                        component={Link}
                        href={`/history/${history?.id}`}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 0.5,
                            px: 1
                        }}
                    >
                        <Box sx={{ marginRight: '1rem', color: grey['A400'], fontSize: '0.75rem', minWidth: 96 }}>
                            {`${prettyDate(new Date(history?.createdAt))}`}
                        </Box>

                        <ListItemText
                            primary={history?.content?.message}
                            primaryTypographyProps={{
                                variant: 'body2',
                                noWrap: true
                            }}
                            sx={{ mr: 1 }}
                        />

                        <ListItemAvatar>
                            <Avatar
                                variant="rounded"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    fontSize: '0.7rem',
                                    bgcolor: `${getLogLevelColor(history?.content?.level)}`
                                }}
                            >
                                {history?.content?.level?.toUpperCase?.()}
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
        return <RecentLogsSkeleton count={10} />;
    }

    if (historyQuerySystem.isError) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    Error loading system logs
                </Typography>
            </Paper>
        );
    }

    return <RecentHistoryListCard title={''} histories={historyQuerySystem.data.history} />;
}
