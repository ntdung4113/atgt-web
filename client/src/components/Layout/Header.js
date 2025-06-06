import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    AppBar, Box, Container, IconButton, Tooltip,
    Avatar, Drawer, List, ListItem, ListItemText, Menu, MenuItem, ListItemButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useAuth from '../../hooks/useAuth';

function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navRef = useRef(null);
    const wrapperRef = useRef(null);
    const [showHamburger, setShowHamburger] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const navigation = useMemo(() => {
        const base = [
            { name: 'Văn bản pháp luật', href: '/laws' },
            { name: 'Mức phạt', href: '/violations' },
            { name: 'Biển báo', href: '/signs' },
            { name: 'Ôn tập', href: '/practice' },
            { name: 'Thi thử', href: '/test' },
            { name: 'Tình huống giao thông', href: '/posts' },
        ];
        if (user?.role === 'admin') {
            return [...base, { name: 'Quản lý', href: '/admin' }];
        }
        return base;
    }, [user?.role]);

    useEffect(() => {
        const updateMenuVisibility = () => {
            if (wrapperRef.current && navRef.current) {
                const wrapperWidth = wrapperRef.current.offsetWidth;
                const navWidth = navRef.current.scrollWidth;
                setShowHamburger(navWidth > wrapperWidth);
            }
        };

        updateMenuVisibility();
        window.addEventListener('resize', updateMenuVisibility);
        return () => window.removeEventListener('resize', updateMenuVisibility);
    }, [navigation]);

    const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    return (
        <>
            <AppBar position="fixed" sx={{ backgroundColor: '#fff', color: '#000', boxShadow: 1 }}>
                <Container maxWidth="lg" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 64,
                    px: 2,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src="/atgt.png" alt="Logo" style={{ height: 36 }} />
                        </Link>
                    </Box>

                    <Box
                        ref={wrapperRef}
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            px: 2,
                        }}
                    >
                        <Box
                            ref={navRef}
                            sx={{
                                display: 'flex',
                                gap: 2,
                                whiteSpace: 'nowrap',
                                visibility: showHamburger ? 'hidden' : 'visible',
                                position: showHamburger ? 'absolute' : 'relative',
                            }}
                        >
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    style={{
                                        textDecoration: 'none',
                                        color: location.pathname === item.href ? '#1976d2' : '#333',
                                        fontWeight: 500,
                                        padding: '8px 16px',
                                        borderRadius: 20,
                                        backgroundColor: location.pathname === item.href ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                                    }}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {showHamburger && (
                            <>
                                <IconButton onClick={() => setDrawerOpen(true)}>
                                    <MenuIcon />
                                </IconButton>
                                <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                                    <Box sx={{ width: 250 }} onClick={() => setDrawerOpen(false)}>
                                        <List>
                                            {navigation.map((item) => (
                                                <ListItem key={item.name} disablePadding>
                                                    <ListItemButton
                                                        component={Link}
                                                        to={item.href}
                                                        selected={location.pathname === item.href}
                                                    >
                                                        <ListItemText primary={item.name} />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </Drawer>
                            </>
                        )}

                        {user ? (
                            <>
                                <Tooltip title="Hồ sơ">
                                    <IconButton onClick={handleAvatarClick}>
                                        <Avatar src={user.picture} sx={{ width: 36, height: 36 }} />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={menuOpen}
                                    onClose={handleMenuClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                style={{
                                    background: '#1976d2',
                                    color: '#fff',
                                    padding: '8px 16px',
                                    borderRadius: 24,
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    whiteSpace: 'nowrap',
                                    minWidth: 90,
                                    textAlign: 'center',
                                    display: 'inline-block',
                                }}
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </Box>
                </Container>
            </AppBar>
            <Box sx={{ height: 64 }} />
        </>
    );
}

export default Header;
