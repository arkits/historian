import { createTheme } from '@mui/material/styles';
import { amber, orange, red, teal } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: orange[800]
        },
        secondary: teal,
        error: {
            main: red.A400
        },
        background: {
            default: '#012B39',
            paper: '#012A37'
        }
    }
});

export default theme;
