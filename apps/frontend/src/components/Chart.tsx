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
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Paper } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
                borderColor: '#f57c00',
                fill: true
            },
            {
                label: 'reddit/upvoted',
                data: chartData.savedCount['reddit/upvoted'],
                borderColor: '#f57c00',
                fill: true
            },
            {
                label: 'spotify/recently-played',
                data: chartData.savedCount['spotify/recently-played'],
                borderColor: '#00e676',
                fill: true
            },
            {
                label: 'youtube/liked',
                data: chartData.savedCount['youtube/liked'],
                borderColor: '#e53935',
                fill: true
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
                    paddingTop: '2rem',
                    marginBottom: '2rem'
                }}
            >
                <Line options={options} data={data} height={60} />
            </Paper>
        </React.Fragment>
    );
}
