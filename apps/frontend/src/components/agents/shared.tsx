import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Typography } from '@mui/material';
import { formatDistance } from 'date-fns';
import { prettyDate } from '../../dateFormat';

export const AgentDetails = ({ queryData }) => {
    if (queryData?.error) {
        return <Box sx={{ mb: 4 }}>{queryData.error}</Box>;
    }

    const connected = Boolean(queryData?.connected);
    const statusColor = connected ? 'success.main' : 'error.main';
    const statusText = connected ? 'Connected' : 'Disconnected';

    if (!queryData) return null;

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                    component="span"
                    sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: statusColor,
                        display: 'inline-block'
                    }}
                    aria-hidden
                />
                <Typography variant="subtitle2" component="span">
                    {statusText}
                </Typography>
                {queryData?.lastSync && (
                    <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                        • Last refreshed {formatDistance(new Date(queryData?.lastSync), new Date(), { addSuffix: true })}
                    </Typography>
                )}
            </Box>

            {connected ? (
                <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total saved: <strong>{queryData?.historyTotal ?? 0}</strong>
                    </Typography>
                </>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    Not connected. Click Connect to authenticate the agent.
                </Typography>
            )}
        </Box>
    );
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
                variant="contained"
            >
                Test Connection
            </LoadingButton>
            <br />

            {connectionTestResult?.message ? (
                <>
                    <br /> Connection Test Result: {connectionTestResult?.message}
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
