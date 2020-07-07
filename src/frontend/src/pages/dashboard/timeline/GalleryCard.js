import React from 'react';
import moment from 'moment';
import {
    Typography,
    Card,
    CardContent,
    Grid,
    CardMedia,
    CardHeader,
    Avatar,
    CardActionArea,
    Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core/styles';

import { red } from '@material-ui/core/colors';
import InstagramIcon from '@material-ui/icons/Instagram';
import RedditIcon from '@material-ui/icons/Reddit';
import DescriptionIcon from '@material-ui/icons/Description';
import MusicNoteRoundedIcon from '@material-ui/icons/MusicNoteRounded';

import TimelineCardDialog from './TimelineCardDialog';
import * as HistoryParser from '../api/HistoryParser';

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

    const handleDialogOpen = () => {
        setInfoDialogOpen(true);
    };

    const handleDialogClose = () => {
        setInfoDialogOpen(false);
    };

    let history = props.history;

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
    return (
        <div>
            <Grid container style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Grid item xs={8}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardHeader
                                avatar={<Avatar className={classes.avatar}>{getPrettyAvatar()}</Avatar>}
                                title={HistoryParser.getPrettyUsername(history)}
                                subheader={moment(history?.timestamp).fromNow()}
                                onClick={handleDialogOpen}
                            />
                            <a href={HistoryParser.getPermalink(history)}>
                                <CardMedia className={classes.media} image={HistoryParser.getThumbnail(history)} />
                            </a>
                            <CardContent onClick={handleDialogOpen}>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    {HistoryParser.getPrettyTitle(history)}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>

            <TimelineCardDialog history={history} handleDialogClose={handleDialogClose} open={infoDialogOpen} />

            <br />
        </div>
    );
}

export default GalleryCard;
