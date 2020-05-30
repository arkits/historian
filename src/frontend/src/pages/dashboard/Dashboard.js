import React, { useContext } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography } from '@material-ui/core/';
import { useLocalStorage } from '../../store/LocalStorage';
import { Redirect } from 'react-router-dom';
import useStyles from './DashboardStyle';
import { observer } from 'mobx-react';
import { HistorianStoreContext } from '../../store/HistorianStore';
import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';
import Timeline from './timeline/Timeline';
import About from './about/About';
import axiosInstance from '../../utils/axios';
import Drawer from './Drawer';
import Settings from './settings/Settings';
import Landing from './landing/Landing';

const Dashboard = observer(() => {
    const classes = useStyles();

    let history = useHistory();

    const historianStore = useContext(HistorianStoreContext);

    const [historianUserCreds] = useLocalStorage('historianUserCreds');

    // not accessible without creds being set
    if (!historianUserCreds?.username && !historianUserCreds?.password) {
        return <Redirect to="/login" />;
    }

    const displayUsername = () => {
        if (historianStore?.user?.username) {
            return historianStore?.user?.name + ' | ' + historianStore?.user?.stats?.total_count + ' saved';
        } else {
            axiosInstance({
                method: 'get',
                url: '/users/user',
                headers: {
                    Authorization: 'Basic ' + btoa(historianUserCreds.username + ':' + historianUserCreds.password)
                }
            })
                .then(function (response) {
                    if (response.status === 200) {
                        historianStore.user = response.data;
                    } else {
                        history.push('/login');
                    }
                })
                .catch(function () {
                    history.push('/login');
                });
        }
    };

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Router basename={process.env.PUBLIC_URL}>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Drawer />
                        <Typography
                            variant="h5"
                            noWrap
                            style={{
                                display: 'flex',
                                flexGrow: '1',
                                fontFamily: 'Fondamento',
                                fontWeight: 'bold'
                            }}
                        >
                            Historian
                        </Typography>
                        <Typography variant="h6" noWrap>
                            {displayUsername()}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <main className={classes.content}>
                    <div className={classes.mainContent}>
                        <Switch>
                            <Route path="/dashboard/about">
                                <About />
                            </Route>
                            <Route path="/dashboard/settings">
                                <Settings />
                            </Route>
                            <Route path="/dashboard/timeline">
                                <Timeline />
                            </Route>
                            <Route path="/dashboard">
                                <Landing />
                            </Route>
                        </Switch>
                    </div>
                </main>
            </Router>
        </div>
    );
});

export default Dashboard;
