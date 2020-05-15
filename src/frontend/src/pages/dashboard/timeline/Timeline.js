import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { HistorianStoreContext } from '../../../store/HistorianStore';
import axiosInstance from '../../../utils/axios';
import { InfiniteLoader, List, AutoSizer } from 'react-virtualized';
import { name } from 'faker';

const Timeline = observer(() => {
    const historianStore = useContext(HistorianStoreContext);

    // states
    const [hasNextPage, setHasNextPage] = React.useState(true);
    const [isNextPageLoading, setIsNextPageLoading] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [sortOrder, setSortOrder] = React.useState('ASC');
    const [offset, setOffset] = React.useState(0);

    // methods
    const loadMoreRows = () => {
        setIsNextPageLoading(true);
        setTimeout(() => {
            setHasNextPage(items.length < 100);
            setIsNextPageLoading(false);
            setItems([...items].concat(new Array(10).fill(true).map(() => ({ name: name.findName() }))));
        }, 500);
    };

    function isRowLoaded({ index }) {
        return !!items[index];
    }

    const itemCount = hasNextPage ? items.length + 1 : items.length;

    function rowRenderer({ key, index, style }) {
        return (
            <div key={key} style={style}>
                {JSON.stringify(items[index])}
            </div>
        );
    }

    return (
        <div className="Timeline" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h1>
                Timeline | {items.length} | isNextPageLoading=
                {JSON.stringify(isNextPageLoading)}
            </h1>
            <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={itemCount}>
                {({ onRowsRendered, registerChild }) => (
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                ref={registerChild}
                                height={height}
                                width={width}
                                rowCount={itemCount}
                                rowHeight={50}
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
