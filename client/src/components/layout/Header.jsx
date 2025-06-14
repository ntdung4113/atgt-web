import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Box, Container, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useAuth from '../hooks/useAuth';
import NavigationLinks from '../ui/Header/NavigationLinks';
import UserMenu from '../ui/Header/UserMenu';
import MobileDrawer from '../ui/Header/MobileDrawer';

function Header() {
    const { user, logout } = useAuth();
    const navRef = useRef(null);
    const wrapperRef = useRef(null);
    const [showHamburger, setShowHamburger] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const navigation = useMemo(() => {
        const base = [
            { name: 'Văn bản pháp luật', href: '/laws' },
            { name: 'Mức phạt', href: '/violations' },
            { name: 'Biển báo', href: '/signs' },
            { name: 'Ôn tập', href: '/practice' },
            { name: 'Thi thử', href: '/test' },
            { name: 'Tình huống giao thông', href: '/situations' },
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
                        <NavigationLinks
                            navigation={navigation}
                            showHamburger={showHamburger}
                            navRef={navRef}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {showHamburger && (
                            <>
                                <IconButton onClick={() => setDrawerOpen(true)}>
                                    <MenuIcon />
                                </IconButton>
                                <MobileDrawer
                                    open={drawerOpen}
                                    onClose={() => setDrawerOpen(false)}
                                    navigation={navigation}
                                />
                            </>
                        )}

                        <UserMenu user={user} onLogout={logout} />
                    </Box>
                </Container>
            </AppBar>
            <Box sx={{ height: 64 }} />
        </>
    );
}

export default Header;
