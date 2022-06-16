import { Card, CardContent, Grid, Typography } from '@mui/material';
import formatDistance from 'date-fns/formatDistance';

export function SystemStatsCard({ dashboardDataQuery }) {
    return (
        <Card sx={{ mb: 4 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14, mb: 2 }} color="text.secondary" gutterBottom>
                    System Stats
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Typography variant="h5" component="div">
                            {dashboardDataQuery?.data?.totalSaved}
                        </Typography>

                        <Typography variant="body1" component="div" color="text.secondary">
                            Total Saved
                        </Typography>
                    </Grid>

                    <Grid item xs={3}>
                        <Typography variant="h5" component="div">
                            {dashboardDataQuery?.data?.savedLast24}
                        </Typography>

                        <Typography variant="body1" component="div" color="text.secondary">
                            last 24 hours
                        </Typography>
                    </Grid>

                    <Grid item xs={3}>
                        <Typography variant="h5" component="div">
                            {dashboardDataQuery?.data?.topAgent}
                        </Typography>

                        <Typography variant="body1" component="div" color="text.secondary">
                            Top Agent
                        </Typography>
                    </Grid>

                    <Grid item xs={3}>
                        <Typography variant="h5" component="div">
                            {dashboardDataQuery?.data?.systemLastSync !== 'Pending'
                                ? formatDistance(new Date(dashboardDataQuery?.data?.systemLastSync), new Date(), {
                                      addSuffix: true
                                  })
                                : 'Pending'}
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
