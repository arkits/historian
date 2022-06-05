import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { useInfiniteQuery, useQuery } from 'react-query';
import { getHistory } from 'apps/frontend/src/fetch';
import { HistoryDetailsCard } from 'apps/frontend/src/components/HistoryDetailsCard';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { Card, Fab, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CasinoIcon from '@mui/icons-material/Casino';
import LoadingButton from '@mui/lab/LoadingButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FONT_LOGO } from 'apps/frontend/src/constants';
import { PageTitle } from 'apps/frontend/src/components/PageTitle';

const TimelinePage: NextPage = () => {
    const router = useRouter();
    const { user, setUser } = React.useContext(HistorianContext);
    React.useEffect(() => {
        isUserLoggedIn(router, setUser);
    }, []);

    // Queries
    const [cursor, setCursor] = React.useState('');

    const fetchHistory = ({ pageParam = '' }) => {
        console.log('pageParam', pageParam);
        return getHistory(pageParam, 50).then((res) => res.json());
    };

    const { isLoading, isError, error, data, fetchNextPage, isFetching, isFetchingNextPage } = useInfiniteQuery(
        ['history'],
        fetchHistory,
        {
            getNextPageParam: (lastPage, pages) => {
                return lastPage?.nextCursor;
            }
        }
    );

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
                    <PageTitle>Timeline</PageTitle>

                    <Card
                        sx={{
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={6}>
                                <TextField id="outlined-basic" label="Search History" variant="outlined" fullWidth />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={10}
                                        label="Age"
                                    >
                                        <MenuItem value={10}>Reddit</MenuItem>
                                        <MenuItem value={20}>Spotify</MenuItem>
                                        <MenuItem value={30}>YouTube</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                md={4}
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Fab color="secondary" variant="extended" aria-label="add" sx={{ marginRight: '12px' }}>
                                    <SearchIcon />
                                    Search
                                </Fab>
                                <Fab variant="extended" aria-label="randomize">
                                    <CasinoIcon />
                                    Randomize
                                </Fab>
                            </Grid>
                        </Grid>
                    </Card>

                    <HistoryTimeline data={data} />

                    <LoadingButton
                        size="large"
                        onClick={() => fetchNextPage()}
                        endIcon={<RefreshIcon />}
                        loading={isLoading || isFetching}
                        loadingPosition="end"
                        variant="contained"
                        sx={{ marginTop: '2rem' }}
                    >
                        Load More
                    </LoadingButton>
                </Box>
            </Container>
        </>
    );
};

const HistoryTimeline = ({ data }) => {
    if (!data?.pages || data?.pages.length === 0) {
        return (
            <div style={{ textAlign: 'center' }}>
                <Container maxWidth="sm">
                    <h3>*dust*</h3>
                </Container>
            </div>
        );
    } else {
        return (
            <>
                {data.pages?.map((group, i) =>
                    group.history.map((history) => <HistoryDetailsCard key={history.id} history={history} />)
                )}
            </>
        );
    }
};

export default TimelinePage;
