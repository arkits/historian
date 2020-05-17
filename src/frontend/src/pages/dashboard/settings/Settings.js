import React, { useState, useEffect, useContext } from 'react';
import { Typography, Card, CardContent, Grid } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import { HistorianStoreContext } from '../../../store/HistorianStore';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1
    }
}));

const Settings = observer(() => {
    const classes = useStyles();

    const historianStore = useContext(HistorianStoreContext);

    const [userMetadata, setUserMetadata] = useState({});

    useEffect(() => {});

    return (
        <div className={classes.root}>
            <Grid container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" style={{ fontFamily: 'Fondamento' }}>
                                Historian Settings
                            </Typography>
                            <br />
                            <br />
                            <center>
                                <Typography variant="h6" style={{ fontFamily: 'Rock Salt' }}>
                                    #NeverForget
                                </Typography>
                            </center>
                        </CardContent>
                    </Card>

                    <br />
                    <Card>
                        <CardContent>
                            <Typography variant="h4" style={{ fontFamily: 'Fondamento' }}>
                                User Data
                            </Typography>
                            <br />
                            <Typography variant="body1">
                                <Typography>Name: {historianStore.user.name}</Typography>
                                <Typography>ID: {historianStore.user.id}</Typography>
                                <Typography>Username: {historianStore.user.username}</Typography>
                                <Typography>History Count: {historianStore?.user?.history?.count}</Typography>
                                <Typography>
                                    {'Reddit Last Saved: '}
                                    {moment(historianStore?.user?.metadata?.reddit_saved?.last_saved).fromNow()}
                                </Typography>
                            </Typography>
                        </CardContent>
                    </Card>

                    <br />

                    <Card>
                        <CardContent>
                            <Typography variant="h4" style={{ fontFamily: 'Fondamento' }}>
                                Debug
                            </Typography>
                            <br />
                            <pre
                                style={{
                                    fontFamily: 'monospace'
                                }}
                            >
                                {JSON.stringify(historianStore, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
});

export default Settings;
