import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            display: true
        }
    }
};

export default function Chart({ chartData }) {
    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'reddit/saved',
                data: chartData.savedCount['reddit/saved'],
                borderColor: 'rgb(245, 124, 0)',
                backgroundColor: 'rgba(245, 124, 0, 0.2)',
                fill: true,
                lineTension: 0.1
            },
            {
                label: 'reddit/upvoted',
                data: chartData.savedCount['reddit/upvoted'],
                borderColor: 'rgb(245, 124, 0)',
                backgroundColor: 'rgba(245, 124, 0, 0.2)',
                fill: true,
                lineTension: 0.1
            },
            {
                label: 'spotify/recently-played',
                data: chartData.savedCount['spotify/recently-played'],
                borderColor: 'rgb(0, 230, 118)',
                backgroundColor: 'rgba(0, 230, 118, 0.2)',
                fill: true,
                lineTension: 0.1
            },
            {
                label: 'youtube/liked',
                data: chartData.savedCount['youtube/liked'],
                borderColor: 'rgb(229, 57, 53)',
                backgroundColor: 'rgba(229, 57, 53, 0.2)',
                fill: true,
                lineTension: 0.1
            }
        ]
    };

    return (
        <React.Fragment>
            <Paper
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '2rem'
                }}
            >
                <Typography variant="body2">Timeline Activity</Typography>
                <Line options={options} data={data} height={60} />
            </Paper>
        </React.Fragment>
    );
}
