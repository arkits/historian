import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { getHistory } from 'apps/frontend/src/fetch';
import CircularProgress from '@mui/material/CircularProgress';
import { HistoryDetailsCard } from 'apps/frontend/src/components/HistoryDetailsCard';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { Card, Fab, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CasinoIcon from '@mui/icons-material/Casino';

const TimelinePage: NextPage = () => {
    const router = useRouter();
    const { user, setUser } = React.useContext(HistorianContext);
    React.useEffect(() => {
        isUserLoggedIn(router, setUser);
    }, []);

    // Queries
    const { isLoading, error, data, isFetching } = useQuery('history', async () => {
        return await getHistory(50).then((res) => res.json());
    });

    if (isLoading || isFetching) {
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

    if (error || !data) {
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
            <Container maxWidth="lg">
                <Box
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontFamily: 'Playfair Display SC, serif', mb: 4, fontWeight: 'bold' }}
                    >
                        Timeline
                    </Typography>

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

                    <HistoryTimeline histories={data.history} />
                </Box>
            </Container>
        </>
    );
};

const HistoryTimeline = ({ histories }) => {
    if (!histories || histories.length === 0) {
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
                {histories?.map((history) => (
                    <HistoryDetailsCard key={history.id} history={history} />
                ))}
            </>
        );
    }
};

export default TimelinePage;
