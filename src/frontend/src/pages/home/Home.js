import React from 'react';
import { Button, Link, Container, CssBaseline, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

function ShoutOuts() {
    return (
        <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center' }}>
            {'#NeverForget // '}
            <Link color="inherit" target="_blank" rel="noopener" href="https://github.com/arkits/historian">
                Historian
            </Link>
            {' by '}
            <Link color="inherit" target="_blank" rel="noopener" href="https://github.com/arkits">
                arkits
            </Link>
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
    },
    main: {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(2)
    },
    footer: {
        padding: theme.spacing(3, 2),
        marginTop: 'auto',
        backgroundColor: theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[800]
    }
}));

export default function StickyFooter() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Container component="main" className={classes.main} maxWidth="sm">
                <Typography variant="h5" component="h2" gutterBottom>
                    #NeverForget
                </Typography>
                <Typography variant="h2" component="h1" gutterBottom>
                    <span role="img" aria-label="detective">
                        🕵
                    </span>{' '}
                    Historian
                </Typography>
                <Typography variant="body1">
                    Historian is a self-hosted full-stack app that gathers your all your data.
                </Typography>
                <br />
                <br />
                <hr />
                <br />
                <center>
                    <Button size="large" component={RouterLink} to="/login" style={{ marginRight: '30px' }}>
                        Login
                    </Button>
                    <Button size="large">Register</Button>
                </center>
            </Container>
            <footer className={classes.footer}>
                <Container maxWidth="sm">
                    <ShoutOuts />
                </Container>
            </footer>
        </div>
    );
}
