import React, { useState, useEffect, useContext } from 'react';
import {
    Typography,
    Card,
    CardContent,
    Grid,
    Container,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    LinearProgress,
    Avatar,
    Divider
} from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import { HistorianStoreContext } from '../../../store/historianStore';
import moment from 'moment';
import axiosInstance from '../../../utils/axios';
import { useLocalStorage } from '../../../store/localStorage';
import * as HistoryParser from '../api/HistoryParser';

const HistoryList = ({ histories }) => {
    return (
        <List>
            {histories?.map((history, index) => (
                <div key={index} onClick={() => window.open(HistoryParser.getPermalink(history), '_blank')}>
                    <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar
                                alt={HistoryParser.getPrettyTitle(history)}
                                src={HistoryParser.getThumbnail(history)}
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={HistoryParser.getPrettyTitle(history, 60)}
                            secondary={
                                <React.Fragment>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        style={{
                                            display: 'inline'
                                        }}
                                        color="textPrimary"
                                    >
                                        {HistoryParser.getPrettyUsername(history)}
                                    </Typography>{' '}
                                    <br />
                                    {moment(history?.timestamp).fromNow()}
                                </React.Fragment>
                            }
                        />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                </div>
            ))}
        </List>
    );
};

const RenderLoading = ({ isLoading }) => {
    if (isLoading) {
        return <LinearProgress />;
    } else {
        return null;
    }
};

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        paddingTop: '20px'
    }
}));

const Landing = observer(() => {
    const classes = useStyles();

    const historianStore = useContext(HistorianStoreContext);

    // User Creds
    const [historianUserCreds] = useLocalStorage('historianUserCreds');

    // States
    const [isLoading, setIsLoading] = useState(false);

    // Defaults
    const limit = 5;
    const relevantHistoryTypes = ['lastfm_nowplaying', 'reddit_saved', 'instagram_saved'];

    // Loads more rows and appends them to histories
    const loadHistories = () => {
        setIsLoading(true);

        relevantHistoryTypes.forEach((historyType) => {
            axiosInstance({
                method: 'get',
                url: `/history?&limit=${limit}&type=${historyType}`,
                headers: {
                    Authorization: 'Basic ' + btoa(historianUserCreds.username + ':' + historianUserCreds.password)
                }
            })
                .then(function (response) {
                    historianStore.landingPosts[historyType] = response.data;
                })
                .catch(function (error) {
                    setIsLoading(false);
                    console.log(error);
                });
        });

        setIsLoading(false);
    };

    // Load rows on page load
    useEffect(() => {
        loadHistories();
    }, []);

    return (
        <div className={classes.root}>
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <br />
                        <Typography variant="h3">Welcome {historianStore.user?.name}!</Typography>
                        <br />

                        <RenderLoading isLoading={isLoading} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Card
                            style={{
                                background: '#d50000'
                            }}
                        >
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    LastFM
                                </Typography>
                                <Typography variant="h3" component="h2">
                                    {historianStore.user?.stats?.lastfm_nowplaying?.count} scrobbles
                                </Typography>
                                <HistoryList histories={historianStore.landingPosts['lastfm_nowplaying']} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card
                            style={{
                                background: '#e65100'
                            }}
                        >
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    Reddit
                                </Typography>
                                <Typography variant="h3" component="h2">
                                    {historianStore.user?.stats?.reddit_saved?.count} saved
                                </Typography>
                                <HistoryList histories={historianStore.landingPosts['reddit_saved']} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card
                            style={{
                                background: '#c51162'
                            }}
                        >
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    Instagram
                                </Typography>
                                <Typography variant="h3" component="h2">
                                    {historianStore.user?.stats?.instagram_saved?.count} saved
                                </Typography>
                                <HistoryList histories={historianStore.landingPosts['instagram_saved']} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
});

export default Landing;
