import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextField, InputAdornment, Typography, Box, Card, CardContent, Chip, Skeleton, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Pagination from '@mui/material/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.REACT_APP_API_URL || '';

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

function highlightText(text, keyword) {
    if (!keyword) return text;
    // Escape regex đặc biệt cho toàn bộ cụm từ
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Regex tìm chính xác cụm từ, không phân biệt hoa thường
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function LawCard({ law, search }) {
    return (
        <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2, '&:hover': { boxShadow: 6, borderColor: 'primary.main' }, textDecoration: 'none' }}>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }} component="div" gutterBottom
                            dangerouslySetInnerHTML={{ __html: highlightText(law.title || law.lawNumber, search) }}
                        />
                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                            <Chip label={law.metadata?.type || 'Khác'} size="small" color="primary" />
                            <Chip label={formatDate(law.issuedDate)} size="small" />
                            <Chip label={`Số hiệu: ${law.lawNumber}`} size="small" />
                            {law.metadata?.issuer && <Chip label={law.metadata.issuer} size="small" />}
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

const fetchLaws = async ({ queryKey }) => {
    const [_key, { type, page, search }] = queryKey;
    let url = '';
    if (search && search.trim() !== '') {
        url = type
            ? `${API_URL}/api/laws/search?q=${encodeURIComponent(search)}&type=${encodeURIComponent(type)}&page=${page}`
            : `${API_URL}/api/laws/search?q=${encodeURIComponent(search)}&page=${page}`;
    } else {
        url = type
            ? `${API_URL}/api/laws?type=${encodeURIComponent(type)}&page=${page}`
            : `${API_URL}/api/laws?page=${page}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
};

function LawList() {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [types] = useState(['Luật', 'Nghị định', 'Thông tư']);
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search, 500);

    // Reset page về 1 khi đổi type hoặc search
    React.useEffect(() => { setPage(1); }, [type, debouncedSearch]);

    // Sử dụng useQuery để fetch danh sách luật
    const {
        data,
        isLoading,
        error
    } = useQuery({
        queryKey: ['laws', { type, page, search: debouncedSearch }],
        queryFn: fetchLaws,
        keepPreviousData: true
    });

    const displayedLaws = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight={700} color="primary.main">Văn bản pháp luật</Typography>
            <Box sx={{ mb: 2 }}>
                <Chip
                    label="Tất cả"
                    color={type === '' ? 'primary' : 'default'}
                    onClick={() => setType('')}
                    sx={{ mr: 1, mb: 1, fontWeight: type === '' ? 700 : 400 }}
                    clickable
                />
                {types.map(t => (
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
                            <Link key={law.lawNumber} to={`/laws/${encodeURIComponent(law.lawNumber)}${search ? `?q=${encodeURIComponent(search)}` : ''}`} style={{ textDecoration: 'none' }}>
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
}

export default LawList;