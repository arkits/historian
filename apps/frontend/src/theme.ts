import { createTheme } from '@mui/material/styles';
import { amber, red, teal } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: amber,
        secondary: teal,
        error: {
            main: red.A400
        }
    }
});

export default theme;
