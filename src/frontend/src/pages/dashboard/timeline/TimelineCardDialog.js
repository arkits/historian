import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Tabs, Tab, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import * as HistoryParser from '../api/HistoryParser';
import { deleteHistory } from '../api/HistorianApi';
import { useLocalStorage } from '../../../store/localStorage';

const useStyles = makeStyles((theme) => ({
    card: {
        display: 'flex'
    },
    contentPreview: {
        width: theme.spacing(18),
        height: theme.spacing(18)
    }
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box
                    p={3}
                    style={{
                        backgroundColor: '#263238'
                    }}
                >
                    <>{children}</>
                </Box>
            )}
        </div>
    );
}

function TimelineCardDialog(props) {

    const [historianUserCreds] = useLocalStorage('historianUserCreds');

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    let history = props.history;
    let handleDialogClose = props.handleDialogClose;
    let open = props.open;

    const [value, setValue] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleDelete = () => {
        deleteHistory(history.id, 'Basic ' + btoa(historianUserCreds.username + ':' + historianUserCreds.password));
        handleDialogClose();
    }

    return (
        <div>
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleDialogClose}
                aria-labelledby="responsive-dialog-title"
                maxWidth={'md'}
                fullWidth
            >
                <DialogTitle id="responsive-dialog-title">{HistoryParser.getPrettyTitle(history)}</DialogTitle>
                <DialogContent>
                    <Tabs
                        value={value}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                        style={{
                            backgroundColor: '#212121'
                        }}
                    >
                        <Tab label="About" />
                        <Tab label="Raw" />
                    </Tabs>

                    <TabPanel value={value} index={0}>
                        <img src={HistoryParser.getThumbnail(history)} alt={HistoryParser.getPrettyTitle(history)} />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <pre
                            style={{
                                fontFamily: 'monospace'
                            }}
                        >
                            {JSON.stringify(history, null, 4)}
                        </pre>
                    </TabPanel>
                </DialogContent>
                <DialogActions>
                    <div style={{ flex: 1 }}>
                        <Button color="primary" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                    <Button autoFocus href={HistoryParser.getPermalink(history)} target="_blank" color="primary">
                        Permalink
                    </Button>
                    <Button onClick={handleDialogClose} color="primary" autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default TimelineCardDialog;
