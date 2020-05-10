import { createMuiTheme } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: amber,
        secondary: {
            main: '#ff6e40'
        }
    },
    typography: {
        fontFamily: [
            'JetBrains Mono',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"'
        ].join(',')
    }
});

export default theme;
