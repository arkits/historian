import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '../../src/Link';

const About: NextPage = () => {
    return (
        <>
            <Container maxWidth="sm">
                <Box
                    maxWidth="sm"
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontFamily: 'Playfair Display SC, serif' }}
                    >
                        About Historian
                    </Typography>

                    <Typography variant="body1" component="p" gutterBottom>
                        Historian is a self-hosted full-stack app that gathers your all your data.
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
                </Box>
            </Container>
        </>
    );
};

export default About;
