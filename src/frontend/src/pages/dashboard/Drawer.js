import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import TimelineRoundedIcon from '@material-ui/icons/TimelineRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import IconButton from '@material-ui/core/IconButton';
import PhotoLibraryRoundedIcon from '@material-ui/icons/PhotoLibraryRounded';
import { Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles({
    drawer: {
        width: 250,
        backgroundColor: 'red'
    }
});

export default function TemporaryDrawer() {
    const classes = useStyles();
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setIsOpen(open);
    };

    return (
        <div>
            <React.Fragment>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleDrawer(true)}
                    edge="start"
                    style={{ color: 'black' }}
                >
                    <MenuIcon />
                </IconButton>

                <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
                    <div role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                        <div className={classes.drawer}></div>
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                height: '100vh',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ flexGrow: '1' }}>
                                <center>
                                    <Typography
                                        variant="h4"
                                        style={{
                                            fontFamily: 'Fondamento',
                                            fontWeight: 'bold',
                                            marginTop: '20px',
                                            marginBottom: '20px'
                                        }}
                                    >
                                        Historian
                                    </Typography>
                                </center>
                                <Divider />
                                <List>
                                    <ListItem button component={RouterLink} to="/dashboard/timeline">
                                        <ListItemIcon>
                                            <TimelineRoundedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={'Timeline'} />
                                    </ListItem>
                                    <ListItem button component={RouterLink} to="/dashboard/search">
                                        <ListItemIcon>
                                            <SearchRoundedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={'Search'} />
                                    </ListItem>
                                    <ListItem button component={RouterLink} to="/dashboard/gallery">
                                        <ListItemIcon>
                                            <PhotoLibraryRoundedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={'Gallery'} />
                                    </ListItem>
                                </List>
                                <Divider />
                                <List>
                                    <ListItem button component={RouterLink} to="/dashboard/settings">
                                        <ListItemIcon>
                                            <SettingsRoundedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={'Settings'} />
                                    </ListItem>
                                    <ListItem button component={RouterLink} to="/dashboard/about">
                                        <ListItemIcon>
                                            <InfoRoundedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={'About Historian'} />
                                    </ListItem>
                                    <ListItem button component={RouterLink} to="/dashboard/login">
                                        <ListItemIcon>
                                            <ExitToAppRoundedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={'Sign Out'} />
                                    </ListItem>
                                </List>
                                <Divider />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <center>
                                    <Typography variant="h6" style={{ fontFamily: 'Rock Salt' }}>
                                        #NeverForget
                                    </Typography>
                                </center>
                            </div>
                        </div>
                    </div>{' '}
                </Drawer>
            </React.Fragment>
        </div>
    );
}
