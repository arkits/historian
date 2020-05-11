import React, { useContext } from 'react';
import clsx from 'clsx';
import { useTheme } from '@material-ui/core/styles';
import {
    Drawer,
    CssBaseline,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@material-ui/core/';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import TimelineRoundedIcon from '@material-ui/icons/TimelineRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import { useLocalStorage } from '../../store/LocalStorage';
import { Redirect } from 'react-router-dom';
import useStyles from './styles';
import { observer } from 'mobx-react';
import { HistorianStoreContext } from '../../store/HistorianStore';
import { BrowserRouter as Router, Switch, Route, Link as RouterLink, useHistory } from 'react-router-dom';

function Home() {
    return <h2>Home</h2>;
}

function About() {
    return <h2>About</h2>;
}

function Search() {
    return <h2>Search</h2>;
}

function Settings() {
    return <h2>Settings</h2>;
}

const Dashboard = observer(() => {
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    let history = useHistory();

    const historianStore = useContext(HistorianStoreContext);

    const [historianUserCreds, setHistorianUserCreds] = useLocalStorage('historianUserCreds');

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    // not accessible without creds being set
    if (!historianUserCreds?.username && !historianUserCreds?.password) {
        return <Redirect to="/login" />;
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Router basename={process.env.PUBLIC_URL}>
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar, {
                        [classes.appBarShift]: open
                    })}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            className={clsx(classes.menuButton, open && classes.hide)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            style={{
                                display: 'flex',
                                flexGrow: '1'
                            }}
                        >
                            Historian
                        </Typography>
                        <Typography variant="h6" noWrap>
                            {historianStore.user.username}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    anchor="left"
                    open={open}
                    classes={{
                        paper: classes.drawerPaper
                    }}
                >
                    <div className={classes.drawerHeader}>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <ListItem button component={RouterLink} to="/dashboard">
                            <ListItemIcon>
                                <TimelineRoundedIcon />
                            </ListItemIcon>
                            <ListItemText>Timeline</ListItemText>
                        </ListItem>
                        <ListItem button component={RouterLink} to="/dashboard/search">
                            <ListItemIcon>
                                <SearchRoundedIcon />
                            </ListItemIcon>
                            <ListItemText>Search</ListItemText>
                        </ListItem>
                    </List>
                    <Divider />
                    <List>
                        <ListItem button component={RouterLink} to="/dashboard/settings">
                            <ListItemIcon>
                                <SettingsRoundedIcon />
                            </ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </ListItem>
                        <ListItem button component={RouterLink} to="/dashboard/about">
                            <ListItemIcon>
                                <InfoRoundedIcon />
                            </ListItemIcon>
                            <ListItemText>About Historian</ListItemText>
                        </ListItem>
                        <ListItem
                            button
                            onClick={() => {
                                history.push('/');
                            }}
                        >
                            <ListItemIcon>
                                <ExitToAppRoundedIcon />
                            </ListItemIcon>
                            <ListItemText>Sign Out</ListItemText>
                        </ListItem>
                    </List>
                    <Divider />
                </Drawer>
                <main
                    className={clsx(classes.content, {
                        [classes.contentShift]: open
                    })}
                >
                    <div className={classes.drawerHeader} />
                    <div>
                        <Switch>
                            <Route path="/dashboard/search">
                                <Search />
                            </Route>
                            <Route path="/dashboard/about">
                                <About />
                            </Route>
                            <Route path="/dashboard/settings">
                                <Settings />
                            </Route>
                            <Route path="/dashboard">
                                <Home />
                            </Route>
                        </Switch>
                    </div>
                </main>
            </Router>
        </div>
    );
});

export default Dashboard;
