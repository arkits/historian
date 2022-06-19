import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HistorianContext from 'apps/frontend/context/historian';
import { useRouter } from 'next/router';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { FONT_LOGO } from 'apps/frontend/src/constants';
import { PageTitle } from 'apps/frontend/src/components/FontTypes';
import { Button } from '@mui/material';
import { getUserDelete } from 'apps/frontend/src/fetch';

const Settings: NextPage = () => {
    const router = useRouter();

    const { user, setUser } = React.useContext(HistorianContext);

    React.useEffect(() => {
        isUserLoggedIn(router, setUser);
    }, []);
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
                    <PageTitle>Settings</PageTitle>

                    <Typography variant="h4" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                        General
                    </Typography>
                    <Typography variant="body1" component="p" gutterBottom>
                        ID: {user?.id} <br />
                        Username: {user?.username}
                    </Typography>

                    <br />
                    <Typography variant="h4" component="h2" gutterBottom sx={{ fontFamily: FONT_LOGO }}>
                        Account
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            getUserDelete();
                        }}
                    >
                        Delete Account
                    </Button>
                </Box>
            </Container>
        </>
    );
};

export default Settings;
