import { Avatar, Box, Card, CardHeader, Grid, Skeleton, CardActions } from '@mui/material';
import theme from '../theme';

/**
 * Skeleton placeholder for HistoryDetailsCard used in the Timeline page while data loads
 */
export const HistoryDetailsCardSkeleton = () => {
    return (
        <div style={{ marginTop: '1rem' }}>
            <Card sx={{ display: 'flex' }}>
                <Grid container spacing={0} sx={{ flex: '1', height: '100%' }}>
                    <Grid size={{ xs: 10 }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}
                        >
                            <Box
                                sx={{
                                    flexGrow: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                }}
                            >
                                <CardHeader
                                    avatar={<Skeleton variant="circular" width={40} height={40} />}
                                    subheader={
                                        <div>
                                            <Skeleton variant="text" width="70%" height={28} />
                                            <Skeleton variant="text" width="50%" height={22} />
                                            <Skeleton variant="text" width="40%" height={18} />
                                        </div>
                                    }
                                    style={{ paddingBottom: '0' }}
                                />

                                <CardActions sx={{ opacity: '1' }}>
                                    <Skeleton variant="rectangular" width={80} height={32} sx={{ mr: 1 }} />
                                    <Skeleton variant="rectangular" width={100} height={32} sx={{ mr: 1 }} />
                                    <Skeleton variant="rectangular" width={60} height={32} />
                                </CardActions>
                            </Box>
                        </div>
                    </Grid>
                    <Grid size={{ xs: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Skeleton
                            variant="rectangular"
                            width={theme.spacing(20)}
                            height={92}
                            sx={{ bgcolor: 'grey.300' }}
                        />
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};

export default HistoryDetailsCardSkeleton;
