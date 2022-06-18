import { Typography } from '@mui/material';
import { FONT_LOGO } from '../constants';

export function PageTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography variant="h3" component="h3" gutterBottom sx={{ fontFamily: FONT_LOGO, mb: 4 }}>
            {children}
        </Typography>
    );
}

export function PageSubtitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography variant="h4" component="h4" gutterBottom sx={{ fontFamily: FONT_LOGO, mb: 4 }}>
            {children}
        </Typography>
    );
}
