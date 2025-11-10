import { Box, Paper, Skeleton, List, ListItem, Grid } from '@mui/material';

/**
 * Skeleton loader for history list items
 */
export function HistoryListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <List sx={{ width: '100%' }}>
            {Array.from({ length: count }).map((_, index) => (
                <ListItem
                    key={index}
                    alignItems="flex-start"
                    sx={{
                        display: 'flex',
                        gap: 2,
                        py: 2,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="80%" height={32} />
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                    <Skeleton variant="rounded" width={92} height={92} />
                </ListItem>
            ))}
        </List>
    );
}

/**
 * Skeleton loader for system stats card
 */
export function SystemStatsCardSkeleton() {
    return (
        <Paper sx={{ p: 3, my: 3 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={40} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={40} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={40} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={40} />
                </Grid>
            </Grid>
        </Paper>
    );
}

/**
 * Skeleton loader for chart
 */
export function ChartSkeleton() {
    return (
        <Paper sx={{ p: 3, my: 3 }}>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} />
        </Paper>
    );
}

/**
 * Skeleton loader for recent logs
 */
export function RecentLogsSkeleton({ count = 5 }: { count?: number }) {
    return (
        <Paper sx={{ p: 2 }}>
            {Array.from({ length: count }).map((_, index) => (
                <Box key={index} sx={{ py: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                    <Skeleton variant="text" width="90%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                </Box>
            ))}
        </Paper>
    );
}
