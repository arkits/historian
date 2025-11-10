import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import HistorianContext from 'apps/frontend/context/historian';
import { signUp, useSession } from 'apps/frontend/src/auth-client';
import { ErrorBanner } from 'apps/frontend/src/components/ErrorBanner';
import Link from 'apps/frontend/src/Link';
import { FONT_LOGO } from 'apps/frontend/src/constants';

const Register: NextPage = () => {
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
        const name = data.get('name') as string;

        const result = await signUp.email({
            email,
            password,
            name
        });

        if (result.error) {
            setLoginError(result.error.message || 'Registration failed');
        } else {
            router.push('/dashboard');
        }
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
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                    Register
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
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
                        autoComplete="new-password"
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
