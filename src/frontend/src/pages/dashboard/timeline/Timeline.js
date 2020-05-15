import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { HistorianStoreContext } from '../../../store/HistorianStore';
import axiosInstance from '../../../utils/axios';
import { InfiniteLoader, List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Typography, Card, CardContent, CircularProgress } from '@material-ui/core';
import './Timeline.css';
import { useLocalStorage } from '../../../store/LocalStorage';

const Timeline = observer(() => {
    const historianStore = useContext(HistorianStoreContext);

    const [historianUserCreds, setHistorianUserCreds] = useLocalStorage('historianUserCreds');

    // states
    const [hasNextPage, setHasNextPage] = React.useState(true);
    const [isNextPageLoading, setIsNextPageLoading] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [sortOrder, setSortOrder] = React.useState('ASC');
    const [offset, setOffset] = React.useState(0);

    let cache = new CellMeasurerCache({
        fixedWidth: true,
        minHeight: 50
    });

    // methods
    const loadMoreRows = () => {
        setIsNextPageLoading(true);
        axiosInstance({
            method: 'get',
            url: '/history',
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

    const isLoadingIndicator = () => {
        if (isNextPageLoading) {
            return <>| Loading...</>;
        } else {
            return null;
        }
    };

    const itemCount = hasNextPage ? items.length + 1 : items.length;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = (index) => !hasNextPage || index < items.length;

    function rowRenderer({ key, index, parent, style }) {
        if (!isItemLoaded(index)) {
            return (
                <div
                    key={key}
                    style={{
                        marginBottom: '10px'
                    }}
                >
                    <Card elevation={1}>
                        <CardContent>
                            <Typography variant="h6">Loading...</Typography>
                        </CardContent>
                    </Card>
                </div>
            );
        } else {
            return (
                <CellMeasurer cache={cache} columnIndex={0} key={key} rowIndex={index} parent={parent}>
                    {({ measure, registerChild }) => (
                        <div ref={registerChild} key={key} onLoad={measure} style={style}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{items[index]?.metadata?.caption}</Typography>
                                    <Typography variant="body1">{items[index]?.metadata?.pk}</Typography>
                                </CardContent>
                            </Card>
                            <br />
                        </div>
                    )}
                </CellMeasurer>
            );
        }
    }

    return (
        <div className="Timeline" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex' }}>
                <div style={{ flexGrow: '1' }}>
                    <Typography variant="h4">Timeline</Typography>
                </div>
                <div>
                    <h3>Loaded - {items.length} {isLoadingIndicator()}</h3>
                </div>
            </div>

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
