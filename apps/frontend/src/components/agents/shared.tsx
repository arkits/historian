import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Typography } from '@mui/material';
import { formatDistance } from 'date-fns';
import { prettyDate } from '../../dateFormat';

export const AgentDetails = ({ queryData }) => {
    if (queryData?.error) {
        return <Box sx={{ mb: 4 }}>{queryData.error}</Box>;
    }

    if (queryData?.connected) {
        if (queryData?.username) {
            return (
                <Typography variant="body1" component="p" gutterBottom>
                    Username: {queryData?.username} <br />
                    Last Refreshed:{' '}
                    {formatDistance(new Date(queryData?.lastSync), new Date(), {
                        addSuffix: true
                    })}{' '}
                    // {prettyDate(new Date(queryData?.lastSync))}
                    <br />
                    <br />
                    Total Saved: {queryData?.historyTotal} <br />
                    <br />
                </Typography>
            );
        } else {
            return (
                <Typography variant="body1" component="p" gutterBottom>
                    Connected, please wait for initial sync to complete.
                    <br /> <br />
                </Typography>
            );
        }
    } else {
        return <></>;
    }
};

const manuallyCollect = (getAgentCollect, setIsManuallyCollecting, setConnectionTestResult) => {
    setIsManuallyCollecting(true);
    getAgentCollect()
        .then((res) => res.json())
        .then((response) => {
            setIsManuallyCollecting(false);
            setConnectionTestResult(response);
        })
        .catch((err) => {
            setIsManuallyCollecting(false);
            console.log(err);
        });
};

export const ConnectionTest = ({
    getAgentCollect,
    isManuallyCollecting,
    setIsManuallyCollecting,
    connectionTestResult,
    setConnectionTestResult
}) => {
    return (
        <>
            <LoadingButton
                onClick={() => manuallyCollect(getAgentCollect, setIsManuallyCollecting, setConnectionTestResult)}
                loading={isManuallyCollecting}
                loadingPosition="end"
                variant="outlined"
            >
                Test Connection
            </LoadingButton>
            <br />

            {connectionTestResult?.message ? (
                <>
                    Connection Test Result: {connectionTestResult?.message}
                    <ul>
                        <li>
                            Fetched:{' '}
                            {connectionTestResult?.details?.savedPosts?.fetched ||
                                connectionTestResult?.details?.recentlyPlayed?.fetched}
                        </li>
                        <li>
                            Saved:{' '}
                            {connectionTestResult?.details?.savedPosts?.saved ||
                                connectionTestResult?.details?.recentlyPlayed?.saved}
                        </li>
                        <li>
                            Skipped:{' '}
                            {connectionTestResult?.details?.savedPosts?.skipped ||
                                connectionTestResult?.details?.recentlyPlayed?.skipped}
                        </li>
                    </ul>
                    Please refresh the page to see the latest results.
                    <br />
                </>
            ) : (
                <></>
            )}
        </>
    );
};
