import {
    Avatar,
    Box,
    Chip,
    Container,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Typography
} from '@mui/material';
import HistorianContext from 'apps/frontend/context/historian';
import { HistoryListSkeleton } from 'apps/frontend/src/components/SkeletonLoaders';
import { getHistory } from 'apps/frontend/src/fetch';
import {
    getPrettyAvatar,
    getPrettyType,
    getSubtitleText,
    getSubtitleText2,
    getThumbnail,
    getTitleText
} from 'apps/frontend/src/historyUtils';
import Link from 'apps/frontend/src/Link';
import { useContext, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import RedditIcon from '@mui/icons-material/Reddit';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

const FILTER_OPTIONS = [
    { value: 'all', label: 'All Services', icon: <AllInclusiveIcon /> },
    { value: 'reddit', label: 'Reddit', icon: <RedditIcon /> },
    { value: 'spotify', label: 'Spotify', icon: <MusicNoteRoundedIcon /> },
    { value: 'youtube', label: 'YouTube', icon: <YouTubeIcon /> },
    { value: 'instagram', label: 'Instagram', icon: <InstagramIcon /> }
];

function RecentHistoryList({ histories }) {
    if (!histories || histories.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No history found for this filter
                </Typography>
            </Box>
        );
    }

    return (
        <List sx={{ width: '100%' }}>
            {histories.slice(0, 10).map((history) => (
                <ListItemButton
                    key={history?.id}
                    component={Link}
                    href={`/history/${history?.id}`}
                    sx={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                        py: 1,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }
                    }}
                >
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 0 }}>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                        variant="body1"
                                        component="span"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: 'vertical'
                                        }}
                                    >
                                        {getTitleText(history)}
                                    </Typography>
                                    <Chip
                                        label={getPrettyType(history?.type)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 18, fontSize: '0.7rem' }}
                                    />
                                </Box>
                            }
                            secondary={
                                <Box sx={{ mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                        {getSubtitleText(history)}
                                    </Typography>
                                    {' • '}
                                    <Typography variant="caption" color="text.secondary" component="span">
                                        {getSubtitleText2(history)}
                                    </Typography>
                                </Box>
                            }
                        />
                        {getThumbnail(history) && (
                            <ListItemAvatar>
                                <Avatar
                                    variant="rounded"
                                    src={getThumbnail(history)}
                                    sx={{ width: 60, height: 60, ml: 2 }}
                                />
                            </ListItemAvatar>
                        )}
                    </ListItem>
                </ListItemButton>
            ))}
        </List>
    );
}

export default function RecentHistory() {
    const { user } = useContext(HistorianContext);
    const [filterType, setFilterType] = useState('all');

    // Fetch all recent history
    const historyQuery = useQuery({
        queryKey: ['dashboardHistory_all'],
        queryFn: async () => {
            return await getHistory('', 20, '', '').then((res) => res.json());
        }
    });

    // Filter histories based on selected type
    const filteredHistories = useMemo(() => {
        if (!historyQuery.data?.history) return [];

        if (filterType === 'all') {
            return historyQuery.data.history;
        }

        return historyQuery.data.history.filter((h) => {
            if (filterType === 'reddit') {
                return h.type?.startsWith('reddit');
            }
            if (filterType === 'spotify') {
                return h.type?.startsWith('spotify');
            }
            if (filterType === 'youtube') {
                return h.type?.startsWith('youtube');
            }
            if (filterType === 'instagram') {
                return h.type?.startsWith('instagram');
            }
            return true;
        });
    }, [historyQuery.data, filterType]);

    if (historyQuery.isLoading) {
        return <HistoryListSkeleton count={10} />;
    }

    if (historyQuery.isError) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center', mt: 4 }}>
                <Container maxWidth="sm">
                    <Typography variant="h6" color="error">
                        Error loading history
                    </Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Paper sx={{ width: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <FormControl fullWidth size="small">
                    <InputLabel id="history-filter-label">Filter by Service</InputLabel>
                    <Select
                        labelId="history-filter-label"
                        id="history-filter"
                        value={filterType}
                        label="Filter by Service"
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        {FILTER_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {option.icon}
                                    {option.label}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <RecentHistoryList histories={filteredHistories} />
        </Paper>
    );
}
