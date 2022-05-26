import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import HistorianContext from 'apps/frontend/context/historian';
import { userRegister } from 'apps/frontend/src/fetch';
import { ErrorBanner } from 'apps/frontend/src/components/ErrorBanner';
import Link from 'apps/frontend/src/Link';

const Register: NextPage = () => {
    const router = useRouter();

    const [loginError, setLoginError] = React.useState<string | null>(null);
    const { user, setUser } = React.useContext(HistorianContext);

    React.useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        userRegister(data.get('username') as string, data.get('password') as string)
            .then((response) => response.json())
            .then((result) => {
                if (result?.error) {
                    setLoginError(result.error);
                } else {
                    setUser(result);
                }
            })
            .catch((error) => console.log('error', error));
    };

    return (
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
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: 'Playfair Display SC, serif' }}>
                    Register
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Create Account
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        component={Link}
                        noLinkStyle
                        href="/login"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>
                    <ErrorBanner error={loginError} />
                </Box>
            </Box>
        </Container>
    );
};

export default Register;
