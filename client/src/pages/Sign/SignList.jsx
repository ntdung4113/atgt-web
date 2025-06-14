import React, { useState } from 'react';
import { Box, Typography, Chip, Grid, Pagination } from '@mui/material';
import SignCard from '../../components/ui/Sign/SignCard';
import SignDetail from '../../components/ui/Sign/SignDetail';
import { useSigns } from '../../components/hooks/useSigns';
import { SIGN_TAGS } from '../../components/utils/constants';

const SignList = () => {
    const [open, setOpen] = useState(false);
    const [selectedSign, setSelectedSign] = useState(null);
    const {
        signs,
        loading,
        selectedTag,
        page,
        totalPages,
        handleTagChange,
        setPage
    } = useSigns();

    const handleOpen = (sign) => {
        setSelectedSign(sign);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSign(null);
    };

    return (
        <Box sx={{ minHeight: '100vh', py: 4, background: '#fff' }}>
            <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1 }}
            >
                Danh sách biển báo
            </Typography>
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                <Chip
                    label="Tất cả"
                    color={selectedTag === '' ? 'primary' : 'default'}
                    onClick={() => handleTagChange('')}
                    sx={{ fontWeight: selectedTag === '' ? 700 : 400, px: 2, py: 1, fontSize: 16, mb: 1 }}
                    clickable
                />
                {SIGN_TAGS.map(tag => (
                    <Chip
                        key={tag.value}
                        label={tag.label}
                        color={selectedTag === tag.value ? 'primary' : 'default'}
                        onClick={() => handleTagChange(tag.value)}
                        sx={{ fontWeight: selectedTag === tag.value ? 700 : 400, px: 2, py: 1, fontSize: 16, mb: 1 }}
                        clickable
                    />
                ))}
            </Box>
            {loading ? (
                <Typography align="center" sx={{ color: 'text.secondary' }}>Đang tải...</Typography>
            ) : (
                <Grid container spacing={2} justifyContent="center">
                    {signs.map(sign => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={sign.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <SignCard sign={sign} onClick={handleOpen} />
                        </Grid>
                    ))}
                </Grid>
            )}
            {!loading && (
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    sx={{ mt: 3, display: totalPages > 1 ? 'flex' : 'none', justifyContent: 'center' }}
                    color="primary"
                    shape="rounded"
                    size="large"
                />
            )}
            <SignDetail
                open={open}
                onClose={handleClose}
                sign={selectedSign}
            />
        </Box>
    );
};

export default SignList; 