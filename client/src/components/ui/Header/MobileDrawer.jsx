import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const MobileDrawer = ({ open, onClose, navigation }) => {
    const location = useLocation();

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 250 }} onClick={onClose}>
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
    );
};

export default MobileDrawer; 