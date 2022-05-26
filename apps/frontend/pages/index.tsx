import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../src/Link';
import HistorianAppBar from '../src/AppBar';
import { Button } from '@mui/material';

const Home: NextPage = () => {
    return (
        <>
            <Container maxWidth="sm">
                <Box
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            gutterBottom
                            sx={{ fontFamily: 'Playfair Display SC, serif' }}
                        >
                            #NeverForget
                        </Typography>
                        <Typography variant="h5" component="h5" gutterBottom>
                            Historian is an open-source app that gathers and archives your all your data from around the
                            web.
                        </Typography>
                        <Button
                            variant="contained"
                            component={Link}
                            noLinkStyle
                            href="/register"
                            sx={{
                                mt: 4
                            }}
                            style={{ marginRight: '12px' }}
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outlined"
                            component={Link}
                            noLinkStyle
                            href="https://github.com/arkits/historian"
                            target={'_blank'}
                            sx={{
                                mt: 4
                            }}
                        >
                            View on GitHub
                        </Button>
                    </div>
                </Box>
            </Container>
        </>
    );
};

export default Home;
