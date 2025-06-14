import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconButton, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';

const UserMenu = ({ user, onLogout }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        handleMenuClose();
        onLogout();
    };

    if (!user) {
        return (
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
        );
    }

    return (
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
    );
};

export default UserMenu; 