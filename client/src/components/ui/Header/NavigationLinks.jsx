import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

const NavigationLinks = ({ navigation, showHamburger, navRef }) => {
    const location = useLocation();

    return (
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
    );
};

export default NavigationLinks; 