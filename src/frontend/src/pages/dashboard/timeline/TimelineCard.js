import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Card, CardContent, Grid, CardHeader, Avatar, CardActionArea } from '@material-ui/core';

import moment from 'moment';

import TimelineCardDialog from './TimelineCardDialog';
import * as HistoryParser from '../api/HistoryParser';

import { red } from '@material-ui/core/colors';
import InstagramIcon from '@material-ui/icons/Instagram';
import RedditIcon from '@material-ui/icons/Reddit';
import DescriptionIcon from '@material-ui/icons/Description';
import MusicNoteRoundedIcon from '@material-ui/icons/MusicNoteRounded';

const useStyles = makeStyles((theme) => ({
    card: {
        display: 'flex'
    },
    contentPreview: {
        width: theme.spacing(18),
        height: theme.spacing(18)
    },
    avatar: {
        backgroundColor: red[500],
        color: 'white'
    }
}));

function TimelineCard(props) {
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
            <Card className={classes.card}>
                <CardActionArea>
                    <Grid container spacing={0}>
                        <Grid item xs={9}>
                            <CardContent className={classes.content} onClick={handleDialogOpen}>
                                <Typography variant="body1" color="textPrimary" component="p">
                                    {HistoryParser.getPrettyTitle(history)}
                                </Typography>
                                <CardHeader
                                    avatar={<Avatar className={classes.avatar}>{getPrettyAvatar()}</Avatar>}
                                    title={HistoryParser.getPrettyUsername(history)}
                                    subheader={moment(history?.timestamp).fromNow()}
                                    style={{
                                        paddingLeft: '0',
                                        paddingBottom: '0'
                                    }}
                                />
                            </CardContent>
                        </Grid>
                        <Grid align="right" item xs={3}>
                            <a href={HistoryParser.getPermalink(history)}>
                                <Avatar
                                    variant="square"
                                    className={classes.contentPreview}
                                    src={HistoryParser.getThumbnail(history)}
                                ></Avatar>
                            </a>
                        </Grid>
                    </Grid>
                </CardActionArea>
            </Card>

            <TimelineCardDialog history={history} handleDialogClose={handleDialogClose} open={infoDialogOpen} />

            <br />
        </div>
    );
}

export default TimelineCard;
