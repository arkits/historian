import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import InfoIcon from '@mui/icons-material/Info';
import { getPrettyAvatar } from '../historyUtils';
import theme from '../theme';
import Link from '../Link';
import { deleteHistoryById } from '../fetch';
import HistorianContext from 'apps/frontend/context/historian';
import { useContext } from 'react';

export const HistoryDetailsCard = ({ history }) => {
    const { setSnackbarDetails } = useContext(HistorianContext);

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
                    Created: {new Date(history?.content?.created_utc * 1000).toDateString()}
                </Typography>
            </>
        );
    };

    return (
        <div style={{ marginTop: '1rem' }}>
            <Card sx={{ display: 'flex' }}>
                <Grid container spacing={0} sx={{ flex: '1', height: theme.spacing(20) }}>
                    <Grid item xs={9}>
                        <CardContent>
                            <Typography variant="body1" color="textPrimary" component="p">
                                {getTitle(history)}
                            </Typography>
                            <CardHeader
                                avatar={<Avatar>{getPrettyAvatar(history)}</Avatar>}
                                subheader={getSubtitle(history)}
                                style={{
                                    paddingLeft: '0',
                                    paddingBottom: '10px'
                                }}
                            />
                            <CardActions>
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
                        </CardContent>
                    </Grid>
                    <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <a href={history?.content?.content_url} target={'_blank'}>
                            <Avatar
                                variant="square"
                                src={history?.content?.thumbnail}
                                style={{ width: theme.spacing(22), height: '100%' }}
                            ></Avatar>
                        </a>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};
