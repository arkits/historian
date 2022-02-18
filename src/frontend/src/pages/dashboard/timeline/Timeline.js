import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core/styles';
import { Waypoint } from 'react-waypoint';

import axiosInstance from '../../../utils/axios';

import { useLocalStorage } from '../../../store/localStorage';

import {
    Grid,
    CircularProgress,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    Button,
    TextField
} from '@material-ui/core';

import SpeedDial from '@material-ui/lab/SpeedDial';
import AddIcon from '@material-ui/icons/Add';
import CasinoIcon from '@material-ui/icons/Casino';

import TimelineCard from './TimelineCard';
import GalleryCard from './GalleryCard';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        position: 'relative',
        height: '100%'
    },
    speedDial: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(3)
    },
    loadingIndicator: {
        position: 'absolute',
        bottom: theme.spacing(2),
        left: theme.spacing(2)
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    selectEmpty: {
        marginTop: theme.spacing(2)
    }
}));

const RenderIsLoading = ({ isLoading }) => {
    if (isLoading) {
        return (
            <>
                <center>
                    <CircularProgress />
                    <p>Loading more Histories...</p>
                </center>
            </>
        );
    } else {
        return null;
    }
};

const Timeline = observer(() => {
    const classes = useStyles();

    // Default number of Histories to pull and offset by
    const limit = 20;

    // User Creds
    const [historianUserCreds] = useLocalStorage('historianUserCreds');

    // States
    const [histories, setHistories] = useState([]);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [historyType, setHistoryType] = useState('all');
    const [clearSavedHistories, setClearSavedHistories] = useState(false);
    const [cardType, setCardType] = useState('compact');

    // Loads more rows and appends them to histories
    const loadMoreRows = () => {
        console.log('Loading...', historyType, clearSavedHistories, offset);
        let url = `/history?offset=${offset}&limit=${limit}`;
        if (historyType !== 'all') {
            url = `/history?offset=${offset}&limit=${limit}&type=${historyType}`;
        }
        setIsLoading(true);
        axiosInstance({
            method: 'get',
            url: url,
            headers: {
                Authorization: 'Basic ' + btoa(historianUserCreds.username + ':' + historianUserCreds.password)
            }
        })
            .then(function (response) {
                setIsLoading(false);
                if (clearSavedHistories) {
                    setHistories([]);
                    setClearSavedHistories(false);
                    setHistories(response.data);
                } else {
                    setHistories([...histories].concat(response.data));
                }
                setOffset(offset + limit);
            })
            .catch(function (error) {
                setIsLoading(false);
                console.log(error);
            });
    };

    const loadRandomHistory = () => {
        console.log('Loading Random...', historyType, offset);
        let url = `/history/random?limit=${limit}`;
        if (historyType !== 'all') {
            url = `/history/random?limit=${limit}&type=${historyType}`;
        }
        setIsLoading(true);
        axiosInstance({
            method: 'get',
            url: url,
            headers: {
                Authorization: 'Basic ' + btoa(historianUserCreds.username + ':' + historianUserCreds.password)
            }
        })
            .then(function (response) {
                setIsLoading(false);
                setHistories([]);
                setHistories(response.data);
            })
            .catch(function (error) {
                setIsLoading(false);
                console.log(error);
            });
    };

    // Load rows on page load
    useEffect(() => {
        loadMoreRows();
    }, [historyType]);

    const handleSpeedDialLoadMore = () => {
        loadMoreRows();
    };

    const handleHistoryTypeChange = (event) => {
        setHistoryType(event.target.value);
        setClearSavedHistories(true);
        setOffset(0);
    };

    const handleCardTypeChange = (event) => {
        setCardType(event.target.value);
        RenderCardContent();
    };

    const RenderCardContent = () => {
        let elements = [];

        histories.map((history, index) => {
            if (cardType === 'compact') {
                elements.push(<TimelineCard history={history} key={index} />);
            } else {
                elements.push(<GalleryCard history={history} key={index} />);
            }
        });

        return elements;
    };

    return (
        <div className={classes.root}>
            <div className={classes.content} style={{ height: '100%', overflowX: 'hidden', paddingTop: '20px' }}>
                <Grid container style={{ justifyContent: 'center', marginBottom: '20px' }}>
                    <Grid item xs={12} sm={6}>
                        <TextField id="search-histories" label="Search Histories..." variant="outlined" fullWidth />
                        <br /> <br />
                        <div style={{ display: 'flex' }}>
                            <div style={{ flex: '1' }}>
                                {' '}
                                <Button
                                    size="large"
                                    variant="outlined"
                                    color="primary"
                                    style={{ marginTop: '15px' }}
                                    startIcon={<CasinoIcon />}
                                    onClick={loadRandomHistory}
                                >
                                    Randomize!
                                </Button>
                            </div>

                            <div>
                                <FormControl variant="outlined" className={classes.formControl}>
                                    <InputLabel>History Type</InputLabel>
                                    <Select value={historyType} onChange={handleHistoryTypeChange} label="History Type">
                                        <MenuItem value={'all'}>All</MenuItem>
                                        <MenuItem value={'instagram_saved'}>Instagram: Saved</MenuItem>
                                        <MenuItem value={'lastfm_nowplaying'}>LastFM: Now Playing</MenuItem>
                                        <MenuItem value={'reddit_saved'}>Reddit: Saved</MenuItem>
                                        <MenuItem value={'web_history'}>Web Browsing History</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl variant="outlined" className={classes.formControl}>
                                    <InputLabel>Card Type</InputLabel>
                                    <Select value={cardType} onChange={handleCardTypeChange} label="Card Type">
                                        <MenuItem value={'compact'}>Compact</MenuItem>
                                        <MenuItem value={'gallery'}>Gallery</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </Grid>
                </Grid>
                <Grid container style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Grid item xs={12} sm={6}>
                        <RenderCardContent />
                        <div>
                            <Waypoint
                                onEnter={() => {
                                    loadMoreRows();
                                }}
                            />
                        </div>
                    </Grid>
                </Grid>
            </div>
            <SpeedDial
                ariaLabel="Load More"
                className={classes.speedDial}
                icon={<AddIcon />}
                onClick={handleSpeedDialLoadMore}
                open={false}
            ></SpeedDial>
            <div className={classes.loadingIndicator}>
                <RenderIsLoading isLoading={isLoading} />
            </div>
        </div>
    );
});

export default Timeline;
