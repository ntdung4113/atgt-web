import React from 'react';
import { Box, Typography } from '@mui/material';

const SignCard = ({ sign, onClick }) => {
    return (
        <Box
            onClick={() => onClick(sign)}
            sx={{
                width: 240,
                height: 200,
                borderRadius: 2,
                boxShadow: 1,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 2,
                background: '#fff',
                border: '1px solid #eee',
                transition: 'box-shadow 0.2s, border 0.2s',
                '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
            }}
        >
            <Box
                sx={{
                    width: 90,
                    height: 90,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    overflow: 'hidden',
                }}
            >
                <img
                    src={sign.url}
                    alt={sign.name}
                    style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                />
            </Box>
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
                {sign.id}
            </Typography>
            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: 600,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: '40px',
                }}
            >
                {sign.name}
            </Typography>
        </Box>
    );
};

export default SignCard; 