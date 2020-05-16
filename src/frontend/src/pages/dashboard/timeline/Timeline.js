import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react';
// import { HistorianStoreContext } from '../../../store/HistorianStore';
import axiosInstance from '../../../utils/axios';
import { InfiniteLoader, List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Grid, CircularProgress } from '@material-ui/core';
import { useLocalStorage } from '../../../store/LocalStorage';

import TimelineCard from './TimelineCard';

const Timeline = observer(() => {
    // const historianStore = useContext(HistorianStoreContext);

    const [historianUserCreds, setHistorianUserCreds] = useLocalStorage('historianUserCreds');

    // States
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [sortOrder, setSortOrder] = useState('DESC');

    let cache = new CellMeasurerCache({
        fixedWidth: true,
        minHeight: 100
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
                if (response.data.length == 0) {
                    setHasNextPage(false);
                } else {
                    setHasNextPage(true);
                }
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
                            <TimelineCard history={items[index]} />
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
