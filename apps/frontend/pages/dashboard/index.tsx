import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { getDashboardData, getHistory } from 'apps/frontend/src/fetch';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { ListItemButton, ListSubheader, Paper } from '@mui/material';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { getPrettyAvatar, getSubtitleText, getTitleText } from 'apps/frontend/src/historyUtils';
import { useEffect } from 'react';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { PageTitle } from 'apps/frontend/src/components/PageTitle';
import Link from 'apps/frontend/src/Link';
import Chart from 'apps/frontend/src/components/Chart';

function RecentHistoryList({ history }) {
    if (!history) {
        return <></>;
    }

    return (
        <List sx={{ width: '100%' }}>
            {history
                .map((item) => (
                    <>
                        <ListItemButton component={Link} href={`/history/${item?.id}`}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar>{getPrettyAvatar(item)}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={getTitleText(item)} secondary={getSubtitleText(item)} />
                            </ListItem>
                        </ListItemButton>
                    </>
                ))
                .slice(0, 10)}
        </List>
    );
}

const Dashboard: NextPage = () => {
    const router = useRouter();
    const { user, setUser } = React.useContext(HistorianContext);
    useEffect(() => {
        isUserLoggedIn(router, setUser);
    }, []);

    // Queries
    const dashboardDataQuery = useQuery('dashboardData', async () => {
        return await getDashboardData().then((res) => res.json());
    });

    const historyQuery = useQuery('dashboardHistory', async () => {
        return await getHistory('', 7).then((res) => res.json());
    });

    if (dashboardDataQuery.isLoading) {
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

    if (dashboardDataQuery.isError) {
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

    const SystemStatsCard = () => {
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
                                Reddit
                            </Typography>

                            <Typography variant="body1" component="div" color="text.secondary">
                                Top Agent
                            </Typography>
                        </Grid>

                        <Grid item xs={3}>
                            <Typography variant="h5" component="div">
                                {dashboardDataQuery?.data?.version}
                            </Typography>

                            <Typography variant="body1" component="div" color="text.secondary">
                                API Version
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    const RecentlySavedHistoryCard = () => {
        return (
            <Paper>
                <List subheader={<ListSubheader sx={{ backgroundColor: '#0E3541' }}>Recently Saved</ListSubheader>}>
                    <RecentHistoryList history={historyQuery.data?.history} />
                </List>
            </Paper>
        );
    };

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
                    <PageTitle>Dashboard</PageTitle>

                    <Chart chartData={dashboardDataQuery?.data?.chartData} />

                    <SystemStatsCard />

                    <RecentlySavedHistoryCard />
                </Box>
            </Container>
        </>
    );
};

export default Dashboard;
