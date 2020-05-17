import React from 'react';
import { Typography, Card, CardContent, Grid, CardMedia, CardHeader, Avatar, CardActionArea } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import InstagramIcon from '@material-ui/icons/Instagram';
import RedditIcon from '@material-ui/icons/Reddit';
import DescriptionIcon from '@material-ui/icons/Description';
import moment from 'moment';

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

function GalleryCard(props) {
    const classes = useStyles();

    let history = props.history;

    const getPrettyTitle = () => {
        let title = '[No Title]';
        if (history?.type === 'instagram_saved') {
            title = history?.metadata?.caption;
        } else {
            title = history?.metadata?.title;
        }
        title = title.slice(0, 150);
        return title;
    };

    const getPrettyAvatar = () => {
        if (history?.type === 'instagram_saved') {
            return <InstagramIcon />;
        } else if (history?.type === 'reddit_saved') {
            return <RedditIcon />;
        } else {
            return <DescriptionIcon />;
        }
    };

    const getPrettyUsername = () => {
        if (history?.type === 'instagram_saved') {
            return history?.metadata?.username;
        } else {
            return history?.metadata?.author;
        }
    };

    const getThumbnail = () => {
        if (history?.type === 'instagram_saved') {
            return history?.metadata?.mediaUrls[0];
        } else {
            if (history?.metadata?.content_url.endsWith('.jpg')) {
                return history?.metadata?.content_url;
            } else {
                return history?.metadata?.thumbnail;
            }
        }
    };

    const getPermalink = () => {
        if (history?.type === 'instagram_saved') {
            return history?.metadata?.mediaUrls[0];
        } else {
            return history?.metadata?.content_url;
        }
    };
    return (
        <Grid container style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Grid item xs={12} sm={4}>
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
    );
}

export default GalleryCard;
