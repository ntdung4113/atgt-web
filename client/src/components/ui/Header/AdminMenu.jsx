import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Menu, MenuItem } from '@mui/material';

const AdminMenu = ({ isMobile }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const location = useLocation();
    const menuOpen = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const menuItems = [
        { name: 'Quản lý tình huống giao thông', href: '/manage-situation' },
    ];

    return (
        <>
            <Box
                onClick={handleClick}
                sx={{
                    textDecoration: 'none',
                    fontWeight: 500,
                    padding: '8px 16px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    backgroundColor: menuOpen ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                    color: menuOpen ? '#1976d2' : '#333',
                    '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    },
                }}
            >
                Quản lý
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: isMobile ? 'top' : 'bottom',
                    horizontal: isMobile ? 'left' : 'center',
                }}
                transformOrigin={{
                    vertical: isMobile ? 'top' : 'top',
                    horizontal: isMobile ? 'right' : 'center',
                }}
                PaperProps={{
                    sx: {
                        mt: isMobile ? 0 : 1,
                        ml: isMobile ? -1 : 0,
                    },
                }}
            >
                {menuItems.map((item) => (
                    <MenuItem
                        key={item.name}
                        component={Link}
                        to={item.href}
                        onClick={handleClose}
                        selected={location.pathname === item.href}
                    >
                        {item.name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default AdminMenu;