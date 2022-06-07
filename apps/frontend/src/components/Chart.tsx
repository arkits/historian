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
            display: false
        }
    }
};

export default function Chart({ chartData }) {
    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Saved to Historian',
                data: chartData.datasetSavedCount,
                borderColor: '#1DE9B6',
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
                <Line options={options} data={data} height={50} />
            </Paper>
        </React.Fragment>
    );
}
