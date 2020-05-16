import React, { useContext } from 'react';
import { Button, Link, Container, CssBaseline, Typography, TextField, Grid } from '@material-ui/core';
import { Link as RouterLink, useHistory, Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import ShoutOuts from '../../components/ShoutOut';
import { useLocalStorage } from '../../store/LocalStorage';
import axiosInstance from '../../utils/axios';
import ErrorCard from '../../components/ErrorCard';
import { observer } from 'mobx-react';
import { HistorianStoreContext } from '../../store/HistorianStore';

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
        backgroundColor: '#FFC105'
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    }
}));

const Login = observer(() => {
    const classes = useStyles();
    let history = useHistory();
    const historianStore = useContext(HistorianStoreContext);

    const [i_username, setUsername] = React.useState('');
    const [i_password, setPassword] = React.useState('');

    const [errorBanner, setErrorBanner] = React.useState(null);

    const [historianUserCreds, setHistorianUserCreds] = useLocalStorage('historianUserCreds');

    if (historianUserCreds?.username && historianUserCreds?.password) {
        return <Redirect to="/dashboard" />;
    }

    const loginOnClick = () => {
        try {
            axiosInstance({
                method: 'get',
                url: '/users/user',
                headers: {
                    Authorization: 'Basic ' + btoa(i_username + ':' + i_password)
                }
            })
                .then(function (response) {
                    if (response.status === 200) {
                        console.log('Auth successful... setting user creds');
                        setHistorianUserCreds({
                            username: i_username,
                            password: i_password
                        });
                        historianStore.user = response.data;
                        history.push('/dashboard');
                    } else {
                        handleFailedAuth();
                    }
                })
                .catch(function () {
                    handleFailedAuth();
                });
        } catch (error) {
            handleFailedAuth();
        }
    };

    const handleFailedAuth = () => {
        console.log('Login failed!');
        setErrorBanner({
            errorTitle: 'Login Failed',
            errorMessage: 'Please check your username and password.'
        });
    };

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Sign In
                    </Typography>
                    <ErrorCard error={errorBanner} />
                    <form className={classes.form} noValidate>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            type="text"
                            value={i_username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={i_password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={loginOnClick}
                        >
                            Sign In
                        </Button>
                        <br />
                        <br />
                        <br />
                        <Grid container>
                            <Grid item>
                                <Link component={RouterLink} to="/register" variant="body2">
                                    {"Don't have an account?"}
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </div>
            </Container>
            <footer className={classes.footer}>
                <Container maxWidth="sm">
                    <ShoutOuts />
                </Container>
            </footer>
        </div>
    );
});

export default Login;
