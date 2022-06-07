import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../../src/Link';
import { Alert, Button, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import HistorianContext from 'apps/frontend/context/historian';
import { getUser, userLogin } from 'apps/frontend/src/fetch';
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

    React.useEffect(() => {
        getUser()
            .then((response) => response.json())
            .then((result) => {
                if (result?.id) {
                    setUser(result);
                    router.push('/dashboard');
                }
            })
            .catch((error) => {});
    }, [setUser]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        // @ts-ignore
        userLogin(data.get('username'), data.get('password'))
            .then((response) => response.json())
            .then((result) => {
                if (result?.error) {
                    setLoginError(result.error);
                } else {
                    setUser(result);
                    router.push('/dashboard');
                }
            })
            .catch((error) => console.log('error', error));
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
