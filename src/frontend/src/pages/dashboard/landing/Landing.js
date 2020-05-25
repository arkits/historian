import React, { useState, useEffect, useContext } from 'react';
import { Typography, Card, CardContent, Grid, Container } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import { HistorianStoreContext } from '../../../store/HistorianStore';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        paddingTop: '20px'
    }
}));

const Landing = observer(() => {
    const classes = useStyles();

    const historianStore = useContext(HistorianStoreContext);

    return (
        <div className={classes.root}>
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <br />
                        <Typography variant="h3">Welcome {historianStore.user?.name}!</Typography>
                        <br />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Card
                            style={{
                                background: '#d50000'
                            }}
                        >
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    LastFM - Scrobbles
                                </Typography>
                                <Typography variant="h3" component="h2">
                                    {historianStore.user?.stats?.lastfm_nowplaying?.count}
                                </Typography>
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
                                    Reddit - Saved Posts
                                </Typography>
                                <Typography variant="h3" component="h2">
                                    {historianStore.user?.stats?.reddit_saved?.count}
                                </Typography>
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
                                    Instagram - Saved Posts
                                </Typography>
                                <Typography variant="h3" component="h2">
                                    {historianStore.user?.stats?.instagram_saved?.count}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
});

export default Landing;
