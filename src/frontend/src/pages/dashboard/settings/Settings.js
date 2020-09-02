import React, { useContext } from 'react';
import { Typography, Card, CardContent, Grid } from '@material-ui/core/';
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

const Settings = observer(() => {
    const classes = useStyles();

    const historianStore = useContext(HistorianStoreContext);

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
                                <b>Name: </b> {historianStore.user.name} <br />
                                <b>User ID: </b>
                                {historianStore.user.id}
                                <br />
                                <b>Username: </b>
                                {historianStore.user.username}
                                <br /> <br />
                                <b>History Count: </b>
                                {historianStore?.user?.stats?.total_count}
                                <br />
                                <b>{'Reddit Last Saved: '}</b>
                                {moment(historianStore?.user?.metadata?.reddit_saved?.last_saved).fromNow()}
                            </Typography>
                        </CardContent>
                    </Card>

                    <br />
                </Grid>
            </Grid>
        </div>
    );
});

export default Settings;
