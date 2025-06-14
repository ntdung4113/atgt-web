import React from 'react';
import { Link } from 'react-router-dom';
import { TextField, InputAdornment, Typography, Box, Chip, Skeleton, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LawCard from '../../components/ui/Law/LawCard';
import { useLaws } from '../../components/hooks/useLaws';
import { DOCUMENT_TYPES } from '../../components/utils/constants';


const LawList = () => {
    const {
        search,
        setSearch,
        type,
        setType,
        page,
        setPage,
        displayedLaws,
        totalPages,
        isLoading,
        error
    } = useLaws();

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight={700} color="primary.main">
                Văn bản pháp luật
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Chip
                    label="Tất cả"
                    color={type === '' ? 'primary' : 'default'}
                    onClick={() => setType('')}
                    sx={{ mr: 1, mb: 1, fontWeight: type === '' ? 700 : 400 }}
                    clickable
                />
                {DOCUMENT_TYPES.map(t => (
                    <Chip
                        key={t}
                        label={t}
                        color={type === t ? 'primary' : 'default'}
                        onClick={() => setType(t)}
                        sx={{ mr: 1, mb: 1, fontWeight: type === t ? 700 : 400 }}
                        clickable
                    />
                ))}
            </Box>
            <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên, số hiệu, nội dung..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 4, background: '#fff', boxShadow: 1 }
                }}
                variant="outlined"
                sx={{ mb: 2 }}
            />
            {isLoading ? (
                <Box>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
                    ))}
                </Box>
            ) : error ? (
                <Typography color="error">Không thể tải danh sách luật</Typography>
            ) : (
                <Box>
                    {displayedLaws.length === 0 ? (
                        <Typography>Không có văn bản nào.</Typography>
                    ) : (
                        displayedLaws.map(law => (
                            <Link
                                key={law.lawNumber}
                                to={`/laws/${encodeURIComponent(law.lawNumber)}${search ? `?q=${encodeURIComponent(search)}` : ''}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <LawCard law={law} search={search} />
                            </Link>
                        ))
                    )}
                </Box>
            )}
            <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                sx={{ mt: 2, display: totalPages > 1 ? 'flex' : 'none', justifyContent: 'center' }}
                color="primary"
                shape="rounded"
                size="large"
            />
        </Box>
    );
};

export default LawList; 