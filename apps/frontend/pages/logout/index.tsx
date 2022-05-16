import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useRouter } from 'next/router';
import { userLogout } from 'apps/frontend/src/fetch';

const About: NextPage = () => {
    const router = useRouter();

    React.useEffect(() => {
        userLogout()
            .then((response) => response.json())
            .then((result) => {
                window.location.assign('/');
            })
            .catch((error) => console.log('error', error));
    }, []);

    return (
        <>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Logging out!
                    </Typography>
                </Box>
            </Container>
        </>
    );
};

export default About;
