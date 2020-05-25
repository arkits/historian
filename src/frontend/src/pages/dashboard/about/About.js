import React from 'react';
import { Typography, Card, CardContent, Grid } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        paddingTop: '20px'
    }
}));

function About() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Grid container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" style={{ fontFamily: 'Fondamento' }}>
                                About Historian
                            </Typography>
                            <br />
                            <Typography variant="body1">
                                Historian is a self-hosted full-stack app that gathers your all your data.
                            </Typography>
                            <br />
                            <center>
                                <Typography variant="h6" style={{ fontFamily: 'Rock Salt' }}>
                                    #NeverForget
                                </Typography>
                            </center>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}

export default About;
