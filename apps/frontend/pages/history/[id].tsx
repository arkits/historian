import { Container, Typography } from '@mui/material';
import HistorianContext from 'apps/frontend/context/historian';
import { getHistoryById } from 'apps/frontend/src/fetch';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';
import { useRouter } from 'next/router';
import { useEffect, useContext } from 'react';
import { useQuery } from 'react-query';

const History = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user, setUser } = useContext(HistorianContext);
    useEffect(() => {
        isUserLoggedIn(router, setUser);
    }, []);

    const historyQuery = useQuery(['history', id], async () => {
        return await getHistoryById(id).then((res) => res.json());
    });

    return (
        <Container maxWidth="lg" sx={{ marginTop: 5 }}>
            <Typography variant="overline" display="block">
                ID: {historyQuery.data?.id}
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
                {historyQuery.data?.content?.title}
            </Typography>

            <pre>{JSON.stringify(historyQuery.data, null, 4)}</pre>
        </Container>
    );
};

export default History;
