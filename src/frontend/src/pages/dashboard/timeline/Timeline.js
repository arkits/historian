import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core/styles';
import { HistorianStoreContext } from '../../../store/HistorianStore';
import axiosInstance from '../../../utils/axios';
import { InfiniteLoader, List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import {
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    CardHeader,
    Avatar,
    ButtonBase
} from '@material-ui/core';
import { useLocalStorage } from '../../../store/LocalStorage';
import moment from 'moment';
import { red } from '@material-ui/core/colors';
import InstagramIcon from '@material-ui/icons/Instagram';

const useStyles = makeStyles((theme) => ({
    avatar: {
        backgroundColor: red[500],
        color: 'white'
    },
    image: {
        width: 128,
        height: '100%',
        paddingLeft: '15px'
    },
    media: {
        paddingTop: '100%'
    },
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%'
    }
}));

const Timeline = observer(() => {
    const historianStore = useContext(HistorianStoreContext);

    const classes = useStyles();

    const [historianUserCreds, setHistorianUserCreds] = useLocalStorage('historianUserCreds');

    // states
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [sortOrder, setSortOrder] = useState('DESC');

    let cache = new CellMeasurerCache({
        fixedWidth: true,
        minHeight: 50
    });

    // methods
    const loadMoreRows = (index) => {
        setIsNextPageLoading(true);
        axiosInstance({
            method: 'get',
            url: `/history?offset=${index.stopIndex}&order=${sortOrder}`,
            headers: {
                Authorization: 'Basic ' + btoa(historianUserCreds.username + ':' + historianUserCreds.password)
            }
        })
            .then(function (response) {
                setHasNextPage(true);
                setIsNextPageLoading(false);
                setItems([...items].concat(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    function isRowLoaded({ index }) {
        return !!items[index];
    }

    const itemCount = hasNextPage ? items.length + 1 : items.length;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = (index) => !hasNextPage || index < items.length;

    function rowRenderer({ key, index, parent, style }) {
        if (!isItemLoaded(index)) {
            return (
                <div key={key} style={style}>
                    <Grid container style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Grid item xs={12} sm={4}>
                            <center>
                                <CircularProgress />
                            </center>
                        </Grid>
                    </Grid>
                </div>
            );
        } else {
            return (
                <CellMeasurer cache={cache} columnIndex={0} key={key} rowIndex={index} parent={parent}>
                    {({ measure, registerChild }) => (
                        <div ref={registerChild} key={key} onLoad={measure} style={style}>
                            <Grid container style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Grid item xs={12} sm={6}>
                                    <Card className={classes.root}>
                                        <CardContent>
                                            <Grid container>
                                                <Grid item style={{ flex: '1' }}>
                                                    <Typography variant="body1" color="textPrimary" component="p">
                                                        {items[index]?.metadata?.caption}
                                                    </Typography>
                                                    <CardHeader
                                                        avatar={
                                                            <Avatar className={classes.avatar}>
                                                                <InstagramIcon />
                                                            </Avatar>
                                                        }
                                                        title={items[index]?.metadata?.username}
                                                        subheader={moment(items[index]?.timestamp).fromNow()}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <ButtonBase className={classes.image}>
                                                        <img
                                                            className={classes.img}
                                                            alt="complex"
                                                            src={items[index]?.metadata?.mediaUrls[0]}
                                                        />
                                                    </ButtonBase>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                            <br />
                        </div>
                    )}
                </CellMeasurer>
            );
        }
    }

    return (
        <div className="Timeline" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={itemCount}>
                {({ onRowsRendered, registerChild }) => (
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                ref={registerChild}
                                height={height}
                                width={width}
                                rowCount={itemCount}
                                rowHeight={cache.rowHeight}
                                rowRenderer={rowRenderer}
                                onRowsRendered={onRowsRendered}
                            />
                        )}
                    </AutoSizer>
                )}
            </InfiniteLoader>
        </div>
    );
});

export default Timeline;