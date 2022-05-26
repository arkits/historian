import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../src/Link';
import HistorianAppBar from '../src/AppBar';

const Home: NextPage = () => {
    return (
        <>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <div style={{ marginTop: '3rem' }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            gutterBottom
                            sx={{ fontFamily: 'Playfair Display SC, serif' }}
                        >
                            #NeverForget
                        </Typography>
                    </div>
                </Box>
            </Container>
        </>
    );
};

export default Home;
