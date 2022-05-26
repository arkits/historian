import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../src/Link';
import HistorianAppBar from '../src/AppBar';
import { Button } from '@mui/material';
import StickyFooter from '../src/components/Footer';
import theme from '../src/theme';

const Home: NextPage = () => {
    return (
        <>
            <div style={{ backgroundColor: '#8e0000', paddingBottom: 50, paddingTop: 10, marginBottom: 50 }}>
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
                                sx={{ fontFamily: 'Playfair Display SC, serif', fontWeight: 'bold' }}
                            >
                                #NeverForget
                            </Typography>
                            <Typography variant="h5" component="h5" gutterBottom>
                                Historian is an open-source app that gathers and archives your all your data from around
                                the web.
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
                        </div>
                    </Box>
                </Container>
            </div>

            <br />
            <br />

            <Container maxWidth="sm" sx={{ marginBottom: 20 }}>
                <Typography
                    variant="h4"
                    component="h3"
                    gutterBottom
                    sx={{ fontFamily: 'Playfair Display SC, serif', fontWeight: 'bold' }}
                >
                    Supported Services
                </Typography>

                <Typography variant="body1" gutterBottom>
                    Historian supports collecting data from the following services:
                </Typography>
                <ul>
                    <li>Reddit - Saved Posts, Upvotes</li>
                    <li>Spotify - Liked Songs, History</li>
                    <li>Instagram - Saved Posts, Likes</li>
                    <li>YouTube - Liked Videos</li>
                </ul>
            </Container>

            <Container maxWidth="sm" sx={{ marginBottom: 20 }}>
                <Typography
                    variant="h4"
                    component="h3"
                    gutterBottom
                    sx={{ fontFamily: 'Playfair Display SC, serif', fontWeight: 'bold' }}
                >
                    Open Source
                </Typography>

                <Typography variant="body1" gutterBottom>
                    Historian is proudly open-source software and licensed under the MIT license.
                </Typography>
                <Button
                    variant="contained"
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
            </Container>

            <br />

            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: '#8e0000'
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="body1">Historian</Typography>
                    <Typography variant="body2" color="text.secondary">
                        <Link color="inherit" href="https://github.com/arkits/historian">
                            About
                        </Link>
                        <br />
                        <Link color="inherit" href="https://github.com/arkits/historian">
                            Github
                        </Link>
                        <br />
                        <Link color="inherit" href="https://github.com/arkits/historian">
                            Privacy Policy
                        </Link>
                        <br />
                        <br />
                    </Typography>
                </Container>
            </Box>
        </>
    );
};

export default Home;
