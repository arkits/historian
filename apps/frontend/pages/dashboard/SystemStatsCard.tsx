import { Card, CardContent, Grid, Typography } from '@mui/material';
import { formatDistance } from 'date-fns';

export default function SystemStatsCard({ dashboardData }) {
    const PrettyLastSync = () => {
        if (dashboardData?.systemLastSync) {
            if (dashboardData?.systemLastSync === 'Pending') {
                return 'Pending';
            } else {
                return formatDistance(new Date(dashboardData?.systemLastSync), new Date(), { addSuffix: true });
            }
        }
        return 'Pending';
    };
    return (
        <Card sx={{ mb: 4 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14, mb: 2 }} color="text.secondary" gutterBottom>
                    System Stats
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 3 }}>
                        <Typography variant="h5" component="div">
                            {dashboardData?.totalSaved}
                        </Typography>

                        <Typography variant="body1" component="div" color="text.secondary">
                            Total Saved
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 3 }}>
                        <Typography variant="h5" component="div">
                            {dashboardData?.savedLast24}
                        </Typography>

                        <Typography variant="body1" component="div" color="text.secondary">
                            last 24 hours
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 3 }}>
                        <Typography variant="h5" component="div">
                            {dashboardData?.topAgent}
                        </Typography>

                        <Typography variant="body1" component="div" color="text.secondary">
                            Top Agent
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 3 }}>
                        <Typography variant="h5" component="div">
                            {PrettyLastSync()}
                        </Typography>

                        <Typography variant="body1" component="div" color="text.secondary">
                            Last Sync
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
