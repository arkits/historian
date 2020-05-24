import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import axiosInstance from '../../../utils/axios';
import { useLocalStorage } from '../../../store/LocalStorage';
import TimelineCard from './TimelineCard';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import FilterListIcon from '@material-ui/icons/FilterList';
import CircularProgress from '@material-ui/core/CircularProgress';

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
    const [speedDialOpen, setSpeedDialOpen] = React.useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Loads more rows and appends them to histories
    const loadMoreRows = () => {
        setIsLoading(true);
        axiosInstance({
            method: 'get',
            url: `/history?offset=${offset}&limit=${limit}`,
            headers: {
                Authorization: 'Basic ' + btoa(historianUserCreds.username + ':' + historianUserCreds.password)
            }
        })
            .then(function (response) {
                setIsLoading(false);
                setHistories([...histories].concat(response.data));
                setOffset(offset + limit);
            })
            .catch(function (error) {
                setIsLoading(false);
                console.log(error);
            });
    };

    // Load rows on page load
    useEffect(() => {
        loadMoreRows();
    }, []);

    const handleSpeedDialClose = () => {
        setSpeedDialOpen(false);
    };

    const handleSpeedDialOpen = () => {
        setSpeedDialOpen(true);
    };

    const handleSpeedDialLoadMore = () => {
        loadMoreRows();
        setSpeedDialOpen(false);
    };

    return (
        <div className={classes.root}>
            <div
                className={classes.content}
                style={{ height: '100%',  overflowX: 'hidden', paddingTop: '20px' }}
            >
                <Grid container style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Grid item xs={12} sm={6}>
                        {histories.map((history, index) => (
                            <TimelineCard history={history} key={index} />
                        ))}
                    </Grid>
                </Grid>
            </div>
            <SpeedDial
                ariaLabel="SpeedDial example"
                className={classes.speedDial}
                icon={<EditIcon />}
                onClose={handleSpeedDialClose}
                onOpen={handleSpeedDialOpen}
                open={speedDialOpen}
                direction={'up'}
            >
                <SpeedDialAction
                    icon={<AddIcon />}
                    tooltipTitle={'Load More'}
                    onClick={handleSpeedDialLoadMore}
                    tooltipOpen
                />
                <SpeedDialAction
                    icon={<FilterListIcon />}
                    tooltipTitle={'Filter'}
                    onClick={handleSpeedDialClose}
                    tooltipOpen
                />
            </SpeedDial>
            <div className={classes.loadingIndicator}>
                <RenderIsLoading isLoading={isLoading} />
            </div>
        </div>
    );
});

export default Timeline;
