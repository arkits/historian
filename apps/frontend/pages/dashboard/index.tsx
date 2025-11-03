import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from 'apps/frontend/src/fetch';

import { useEffect } from 'react';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { PageSubtitle, PageTitle } from 'apps/frontend/src/components/FontTypes';

import Chart from 'apps/frontend/src/components/Chart';
import RecentHistory from './RecentHistory';
import LoadingSpinner from 'apps/frontend/src/components/LoadingSpinner';
import SystemStatsCard from './SystemStatsCard';
import { Typography } from '@mui/material';
import RecentLogs from './RecentLogs';

const Dashboard: NextPage = () => {
    const router = useRouter();
    const { user, setUser } = React.useContext(HistorianContext);
    useEffect(() => {
        isUserLoggedIn(router, setUser);
    }, []);

    // Queries
    const dashboardDataQuery = useQuery({
        queryKey: ['dashboardData'],
        queryFn: async () => {
            return await getDashboardData().then((res) => res.json());
        }
    });

    if (dashboardDataQuery.isLoading) {
        return <LoadingSpinner />;
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

    return (
        <>
            <Container maxWidth="xl">
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
                    <SystemStatsCard dashboardData={dashboardDataQuery?.data} />
                    <PageSubtitle>Recently Saved</PageSubtitle>
                    <RecentHistory />
                    <br />
                    <PageSubtitle>System Logs</PageSubtitle>
                    <RecentLogs />
                </Box>
            </Container>
        </>
    );
};

export default Dashboard;
