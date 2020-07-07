import React from 'react';
import { Typography, Card, CardContent, Grid, CardMedia, CardHeader, Avatar, CardActionArea } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import InstagramIcon from '@material-ui/icons/Instagram';
import RedditIcon from '@material-ui/icons/Reddit';
import DescriptionIcon from '@material-ui/icons/Description';
import MusicNoteRoundedIcon from '@material-ui/icons/MusicNoteRounded';
import moment from 'moment';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { useTheme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
    avatar: {
        backgroundColor: red[500],
        color: 'white'
    },
    image: {
        width: 128,
        height: '100%',
        paddingLeft: '15px'
    },
    media: {
        paddingTop: '100%',
        minHeight: 100
    },
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%'
    }
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box
                    p={3}
                    style={{
                        borderStyle: 'hidden solid solid',
                        borderRadius: '0px 0px 10px 10px',
                        borderWidth: '1px'
                    }}
                >
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function GalleryCard(props) {
    const classes = useStyles();

    const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClickOpen = () => {
        setInfoDialogOpen(true);
    };

    const handleClose = () => {
        setInfoDialogOpen(false);
    };

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    let history = props.history;

    const getPrettyTitle = () => {
        let title = '';
        if (history?.type === 'instagram_saved') {
            title = history?.metadata?.caption;
        } else if (history?.type === 'lastfm_nowplaying') {
            title = history?.metadata?.name;
        } else {
            title = history?.metadata?.title;
        }

        try {
            if (title.length > 150) {
                title = title.slice(0, 150) + '...';
            }
        } catch (error) {
            title = '[No Title]';
        }

        return title;
    };

    const getPrettyAvatar = () => {
        if (history?.type === 'instagram_saved') {
            return <InstagramIcon />;
        } else if (history?.type === 'reddit_saved') {
            return <RedditIcon />;
        } else if (history?.type === 'lastfm_nowplaying') {
            return <MusicNoteRoundedIcon />;
        } else {
            return <DescriptionIcon />;
        }
    };

    const getPrettyUsername = () => {
        if (history?.type === 'instagram_saved') {
            return history?.metadata?.username;
        } else if (history?.type === 'lastfm_nowplaying') {
            return history?.metadata?.artist['#text'] + ' // ' + history?.metadata?.album['#text'];
        } else {
            return history?.metadata?.author;
        }
    };

    const getThumbnail = () => {
        if (history?.type === 'instagram_saved') {
            return history?.metadata?.mediaUrls[0];
        } else if (history?.type === 'lastfm_nowplaying') {
            return history?.metadata?.image[history?.metadata?.image.length - 1]['#text'];
        } else {
            return history?.metadata?.thumbnail;
        }
    };

    const getPermalink = () => {
        if (history?.type === 'instagram_saved') {
            return history?.metadata?.mediaUrls[0];
        } else if (history?.type === 'lastfm_nowplaying') {
            return history?.metadata?.url;
        } else {
            return history?.metadata?.content_url;
        }
    };
    return (
        <div>
            <Grid container style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Grid item xs={12}>
                    <Card className={classes.root}>
                        <CardActionArea target="_blank" href={getPermalink()}>
                            <CardHeader
                                avatar={<Avatar className={classes.avatar}>{getPrettyAvatar()}</Avatar>}
                                title={getPrettyUsername()}
                                subheader={moment(history?.timestamp).fromNow()}
                            />
                            <CardMedia className={classes.media} image={getThumbnail()} />
                            <CardContent>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    {getPrettyTitle()}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>

            <Dialog
                fullScreen={fullScreen}
                open={infoDialogOpen}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
                maxWidth={'md'}
                fullWidth
            >
                <DialogTitle id="responsive-dialog-title">{getPrettyTitle()}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            centered
                            style={{
                                backgroundColor: '#212121'
                            }}
                        >
                            <Tab label="About" />
                            <Tab label="Raw" />
                        </Tabs>

                        <TabPanel value={value} index={0}>
                            <img src={getThumbnail()} alt={getPrettyTitle()} />
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <pre
                                style={{
                                    fontFamily: 'monospace'
                                }}
                            >
                                {JSON.stringify(history, null, 4)}
                            </pre>
                        </TabPanel>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus href={getPermalink()} target="_blank" color="primary">
                        Permalink
                    </Button>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <br />
        </div>
    );
}

export default GalleryCard;
