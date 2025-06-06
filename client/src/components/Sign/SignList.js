import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Chip, Grid, Dialog } from '@mui/material';
import Pagination from '@mui/material/Pagination';

const TAGS = [
    { value: 'Biển báo cấm', label: 'Biển báo cấm' },
    { value: 'Biển báo nguy hiểm', label: 'Biển báo nguy hiểm' },
    { value: 'Biển báo hiệu lệnh', label: 'Biển báo hiệu lệnh' },
    { value: 'Biển báo chỉ dẫn', label: 'Biển báo chỉ dẫn' },
    { value: 'Biển báo phụ', label: 'Biển báo phụ' },
    { value: 'Vạch kẻ đường', label: 'Vạch kẻ đường' },
];

const SignList = () => {
    const [signs, setSigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedSign, setSelectedSign] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 20;
    const [pendingTag, setPendingTag] = useState(null);

    useEffect(() => {
        setPage(1);
    }, [selectedTag]);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        }
    }, [totalPages, page]);

    useEffect(() => {
        if (pendingTag !== null) return;
        setLoading(true);
        let url = `/api/signs?page=${page}&limit=${LIMIT}`;
        if (selectedTag) {
            url = `/api/signs/tag/${selectedTag}?page=${page}&limit=${LIMIT}`;
        }
        axios.get(url)
            .then(res => {
                setSigns(Array.isArray(res.data.data) ? res.data.data : res.data);
                setTotalPages(res.data.totalPages || 1);
            })
            .finally(() => setLoading(false));
    }, [selectedTag, page, pendingTag]);

    const handleOpen = (sign) => {
        setSelectedSign(sign);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSign(null);
    };

    const handleTagChange = (tag) => {
        if (page !== 1) {
            setPendingTag(tag);
            setPage(1);
        } else {
            setSelectedTag(tag);
        }
    };

    useEffect(() => {
        if (pendingTag !== null && page === 1) {
            setSelectedTag(pendingTag);
            setPendingTag(null);
        }
    }, [pendingTag, page]);

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
                {TAGS.map(tag => (
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
                            <Box
                                onClick={() => handleOpen(sign)}
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
            <Dialog
                open={open}
                onClose={handleClose}
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
                {selectedSign && (
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
                                src={selectedSign.url}
                                alt={selectedSign.name}
                                style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {selectedSign.name}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                                {selectedSign.id}
                            </Typography>
                            {selectedSign.description && (
                                <Typography variant="body1" sx={{ mt: 1 }}>{selectedSign.description}</Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </Dialog>
        </Box>
    );
};

export default SignList;
