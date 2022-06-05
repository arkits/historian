import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import InfoIcon from '@mui/icons-material/Info';
import { getPrettyAvatar } from '../historyUtils';
import theme from '../theme';
import Link from '../Link';
import { deleteHistoryById } from '../fetch';
import HistorianContext from 'apps/frontend/context/historian';
import { useContext, useState } from 'react';
import { prettyDate } from '../dateFormat';
import clsx from 'clsx';

export const HistoryDetailsCard = ({ history }) => {
    const { setSnackbarDetails } = useContext(HistorianContext);

    const [showActions, setShowActions] = useState(false);

    const getTitle = (history) => {
        return history?.content?.title ?? 'NO TITLE';
    };

    const getSubtitle = (history) => {
        return (
            <>
                <Typography variant="body2">
                    /{history?.content?.subreddit} • {history?.content?.author}
                </Typography>
                <Typography variant="body2">
                    Posted: {prettyDate(new Date(history?.content?.created_utc * 1000))}
                </Typography>
            </>
        );
    };

    return (
        <div style={{ marginTop: '1rem' }}>
            <Card
                sx={{ display: 'flex' }}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                <Grid container spacing={0} sx={{ flex: '1', height: '100%' }}>
                    <Grid item xs={9}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}
                        >
                            <CardContent
                                sx={{
                                    flexGrow: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-around'
                                }}
                            >
                                <Typography variant="body1" color="textPrimary" component="p">
                                    {getTitle(history)}
                                </Typography>
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ backgroundColor: '#B9C2C6' }}>{getPrettyAvatar(history)}</Avatar>
                                    }
                                    subheader={getSubtitle(history)}
                                    style={{
                                        paddingLeft: '0',
                                        paddingBottom: '10px'
                                    }}
                                />
                            </CardContent>
                            <CardActions
                                sx={{ paddingLeft: '12px', visibility: `${showActions ? 'visible' : 'hidden'}` }}
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
                                    href={'https://reddit.com' + history?.content?.permalink || '#'}
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
                                            message: 'Deleted History'
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
                        </div>
                    </Grid>
                    <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <a href={history?.content?.content_url} target={'_blank'}>
                            <Avatar
                                variant="square"
                                src={history?.content?.thumbnail}
                                style={{ width: theme.spacing(25), height: '100%', backgroundColor: '#B9C2C6' }}
                            ></Avatar>
                        </a>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};
