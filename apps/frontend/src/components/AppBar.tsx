import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Link from '../Link';
import HistorianContext from '../../context/historian';
import { getUser } from '../fetch';
import { amber, teal } from '@mui/material/colors';

const pages = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Timeline', href: '/timeline' },
    { name: 'Agents', href: '/agents' }
];
const settings = [
    { name: 'Settings', href: '/settings' },
    { name: 'Logout', href: '/logout' }
];

const UserOptions = ({ user }) => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    if (!user) {
        return (
            <Button sx={{ my: 2, color: 'white', display: 'block' }} component={Link} noLinkStyle href={'/login'}>
                Login
            </Button>
        );
    }

    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                        alt={user?.username.toUpperCase()}
                        sx={{ backgroundColor: teal.A400 }}
                        src="/static/images/avatar/2.jpg"
                    />
                </IconButton>
            </Tooltip>
            <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
                {settings.map((setting) => (
                    <MenuItem
                        key={setting.name}
                        onClick={handleCloseUserMenu}
                        component={Link}
                        noLinkStyle
                        href={setting.href}
                    >
                        <Typography textAlign="center">{setting.name}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

const HistorianAppBar = () => {
    const { user, setUser } = React.useContext(HistorianContext);

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    return (
        <AppBar position="static" color="primary" enableColorOnDark>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'Playfair Display SC, serif',
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none'
                        }}
                    >
                        Historian
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left'
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                            }}
                            open={Boolean(anchorElNav)}
                            sx={{
                                display: { xs: 'block', md: 'none' }
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page.name} component={Link} noLinkStyle href={page.href}>
                                    <Typography textAlign="center">{page.name}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <Typography
                        variant="h5"
                        noWrap
                        component={Link}
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'Playfair Display SC, serif',
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none'
                        }}
                    >
                        Historian
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page.name}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                                component={Link}
                                noLinkStyle
                                href={page.href}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </Box>

                    <UserOptions user={user} />
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default HistorianAppBar;
