import { Avatar, Box, Button, Card, CardActions, CardHeader, Grid, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import InfoIcon from '@mui/icons-material/Info';
import { getPrettyAvatar, getSubtitleText, getSubtitleText2, getThumbnail, getTitleText } from '../historyUtils';
import theme from '../theme';
import Link from '../Link';
import { deleteHistoryById } from '../fetch';
import HistorianContext from 'apps/frontend/context/historian';
import { useContext, useState } from 'react';

export const HistoryDetailsCard = ({ history }) => {
    const { setSnackbarDetails } = useContext(HistorianContext);

    const [showActions, setShowActions] = useState(false);

    return (
        <div style={{ marginTop: '1rem' }}>
            <Card
                sx={{ display: 'flex' }}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                <Grid container spacing={0} sx={{ flex: '1', height: '100%' }}>
                    <Grid item xs={10}>
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
                                    avatar={
                                        <Avatar sx={{ backgroundColor: '#B9C2C6' }}>{getPrettyAvatar(history)}</Avatar>
                                    }
                                    subheader={
                                        <>
                                            <Typography variant="body1" color="textPrimary" component="p">
                                                {getTitleText(history)}
                                            </Typography>
                                            <Typography variant="body2" color="inherit" component="p">
                                                {getSubtitleText(history)}
                                            </Typography>
                                            <Typography variant="body2">{getSubtitleText2(history)}</Typography>
                                        </>
                                    }
                                    style={{
                                        paddingBottom: '0'
                                    }}
                                />
                                <CardActions
                                    sx={{
                                        opacity: `${showActions ? '1' : '0'}`,
                                        transition: 'opacity 0.1s ease-in-out'
                                    }}
                                >
                                    <Button
                                        color="inherit"
                                        size="small"
                                        startIcon={<InfoIcon />}
                                        component={Link}
                                        noLinkStyle
                                        href={'/history/' + history?.id}
                                        sx={{ marginRight: '12px', color: '#B9C2C6' }}
                                    >
                                        Details
                                    </Button>
                                    <Button
                                        color="inherit"
                                        size="small"
                                        startIcon={<LaunchIcon />}
                                        component={Link}
                                        noLinkStyle
                                        href={history?.content?.permalink || '#'}
                                        target={'_blank'}
                                        sx={{ marginRight: '12px', color: '#B9C2C6' }}
                                    >
                                        Permalink
                                    </Button>
                                    <Button
                                        color="inherit"
                                        size="small"
                                        sx={{ marginRight: '12px', color: '#B9C2C6' }}
                                        startIcon={<DeleteIcon />}
                                        onClick={() => {
                                            setSnackbarDetails({
                                                open: true,
                                                message: `Deleted History - ${history?.id}`
                                            });
                                            deleteHistoryById(history?.id)
                                                .then((response) => response.json())
                                                .then((res) => {
                                                    console.log('deleted', res);
                                                })
                                                .catch((err) => {
                                                    console.log(err);
                                                });
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </CardActions>
                            </Box>
                        </div>
                    </Grid>
                    <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <a href={history?.content?.content_url} target={'_blank'}>
                            <Avatar
                                variant="square"
                                src={getThumbnail(history)}
                                style={{
                                    width: theme.spacing(20),
                                    height: '100%',
                                    backgroundColor: '#B9C2C6'
                                }}
                            ></Avatar>
                        </a>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};
