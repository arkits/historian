import React from 'react';
import { Typography, Card, CardContent, Grid, CardHeader, Avatar, ButtonBase, CardActionArea } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import InstagramIcon from '@material-ui/icons/Instagram';
import RedditIcon from '@material-ui/icons/Reddit';
import DescriptionIcon from '@material-ui/icons/Description';
import MusicNoteRoundedIcon from '@material-ui/icons/MusicNoteRounded';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    card: {
        display: 'flex'
    },
    contentPreview: {
        width: '100%',
        height: '100%',
        maxHeight: '120px'
    },
    avatar: {
        backgroundColor: red[500],
        color: 'white'
    }
}));

function TimelineCard(props) {
    const classes = useStyles();

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
            <Card className={classes.card}>
                <CardActionArea target="_blank" href={getPermalink()}>
                    <Grid container spacing={0}>
                        <Grid item xs={9}>
                            <CardContent className={classes.content}>
                                <Typography variant="body1" color="textPrimary" component="p">
                                    {getPrettyTitle()}
                                </Typography>
                                <CardHeader
                                    avatar={<Avatar className={classes.avatar}>{getPrettyAvatar()}</Avatar>}
                                    title={getPrettyUsername()}
                                    subheader={moment(history?.timestamp).fromNow()}
                                    style={{
                                        paddingLeft: '0',
                                        paddingBottom: '0'
                                    }}
                                />
                            </CardContent>
                        </Grid>
                        <Grid align="right" item xs={3}>
                            <Avatar variant="square" className={classes.contentPreview} src={getThumbnail()}></Avatar>
                        </Grid>
                    </Grid>
                </CardActionArea>
            </Card>

            <br />
        </div>
    );
}

export default TimelineCard;
