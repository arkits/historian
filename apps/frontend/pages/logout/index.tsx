import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useRouter } from 'next/router';
import { signOut } from 'apps/frontend/src/auth-client';

const About: NextPage = () => {
    const router = useRouter();

    React.useEffect(() => {
        signOut()
            .then(() => {
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
