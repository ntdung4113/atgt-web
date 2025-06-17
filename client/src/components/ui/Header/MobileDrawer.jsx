import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const MobileDrawer = ({ open, onClose, navigation }) => {
    const location = useLocation();

    const adminMenuItems = [
        { name: 'Quản lý tình huống giao thông', href: '/manage-situation' },
    ];

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 300 }} onClick={onClose}>
                <List>
                    {navigation.map((item) =>
                        item.name === 'Quản lý' ? (
                            <React.Fragment key={item.name}>
                                <ListItem disablePadding>
                                    <ListItemButton disabled>
                                        <ListItemText
                                            primary={item.name}
                                            primaryTypographyProps={{ fontWeight: 600 }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                {adminMenuItems.map((subItem) => (
                                    <ListItem key={subItem.name} disablePadding sx={{ pl: 4 }}>
                                        <ListItemButton
                                            component={Link}
                                            to={subItem.href}
                                            selected={location.pathname === subItem.href}
                                        >
                                            <ListItemText primary={subItem.name} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </React.Fragment>
                        ) : (
                            <ListItem key={item.name} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.href}
                                    selected={location.pathname === item.href}
                                >
                                    <ListItemText primary={item.name} />
                                </ListItemButton>
                            </ListItem>
                        )
                    )}
                </List>
            </Box>
        </Drawer>
    );
};

export default MobileDrawer;