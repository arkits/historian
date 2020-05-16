import React, { useContext, useState } from 'react';
import {
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    CardHeader,
    Avatar,
    ButtonBase
} from '@material-ui/core';
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

function TimelineCard(props) {
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
            return history?.metadata?.thumbnail;
        }
    };
    return (
        <Grid container style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Grid item xs={12} sm={6}>
                <Card className={classes.root}>
                    <CardContent>
                        <Grid container>
                            <Grid item style={{ flex: '1' }}>
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
                            </Grid>
                            <Grid item>
                                <ButtonBase className={classes.image}>
                                    <img className={classes.img} alt="complex" src={getThumbnail()} />
                                </ButtonBase>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

export default TimelineCard;
