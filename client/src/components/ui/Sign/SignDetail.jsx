import React from 'react';
import { Box, Typography, Dialog } from '@mui/material';

const SignDetail = ({ open, onClose, sign }) => {
    if (!sign) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: '#fff',
                    boxShadow: 6,
                    p: 2,
                    border: '1px solid #eee'
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 180 }}>
                <Box
                    sx={{
                        width: 140,
                        height: 140,
                        background: '#fff',
                        overflow: 'hidden',
                        borderRadius: 2,
                        mr: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #eee',
                        flexShrink: 0
                    }}
                >
                    <img
                        src={sign.url}
                        alt={sign.name}
                        style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                    />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {sign.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                        {sign.id}
                    </Typography>
                    {sign.description && (
                        <Typography variant="body1" sx={{ mt: 1 }}>{sign.description}</Typography>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
};

export default SignDetail; 