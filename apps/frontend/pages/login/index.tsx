import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../../src/Link';
import { Alert, Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import HistorianContext from 'apps/frontend/context/historian';
import { signIn, useSession } from 'apps/frontend/src/auth-client';
import { FONT_LOGO } from 'apps/frontend/src/constants';

const LoginError = ({ error }) => {
    if (!error) {
        return null;
    }

    return (
        <Alert variant="filled" severity="error" sx={{ mt: 5 }}>
            {error}
        </Alert>
    );
};

const Login: NextPage = () => {
    const router = useRouter();

    const [loginError, setLoginError] = React.useState<string | null>(null);
    const { user, setUser } = React.useContext(HistorianContext);
    const { data: session } = useSession();

    React.useEffect(() => {
        if (session?.user) {
            setUser(session.user);
            router.push('/dashboard');
        }
    }, [session, setUser, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const email = data.get('email') as string;
        const password = data.get('password') as string;

        const result = await signIn.email({
            email,
            password
        });

        if (result.error) {
            setLoginError(result.error.message || 'Login failed');
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    my: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                    Login
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        type="email"
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
                        Sign In
                    </Button>
                    <Button
                        type="submit"
                        fullWidth
                        variant="outlined"
                        component={Link}
                        noLinkStyle
                        href="/register"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Register
                    </Button>
                    <LoginError error={loginError} />
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
