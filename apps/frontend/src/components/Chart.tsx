import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, BarChart, Tooltip, Bar, Legend } from 'recharts';
import { Paper } from '@mui/material';

export default function Chart({ chartData }) {
    const theme = useTheme();

    return (
        <React.Fragment>
            <Paper
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 300,
                    paddingTop: '2.5rem',
                    marginBottom: '2rem'
                }}
            >
                <ResponsiveContainer>
                    <LineChart
                        width={500}
                        height={500}
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5
                        }}
                    >
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} style={theme.typography.body2} />
                        <YAxis stroke={theme.palette.text.secondary} style={theme.typography.body2} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="savedCount"
                            stroke={theme.palette.secondary.main}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        </React.Fragment>
    );
}
