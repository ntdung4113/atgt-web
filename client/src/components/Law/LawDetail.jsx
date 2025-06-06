import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material';
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
    // Tách các từ trong keyword
    const words = keyword.trim().split(/\s+/);
    // Tạo regex cho phép bất kỳ khoảng trắng nào giữa các từ (kể cả &nbsp;)
    const pattern = words.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('[\\s\u00A0]+');
    const regex = new RegExp(`(${pattern})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

const fetchLawDetail = async (lawNumber) => {
    const res = await fetch(`${API_URL}/api/laws/${encodeURIComponent(lawNumber)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
};

function LawDetail() {
    const { lawNumber } = useParams();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const search = params.get('q') || '';

    const { data: law, isLoading, error } = useQuery({
        queryKey: ['lawDetail', lawNumber],
        queryFn: () => fetchLawDetail(lawNumber)
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">Không thể tải chi tiết văn bản</Typography>;
    }

    if (!law) {
        return <Typography>Không tìm thấy văn bản.</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 1500, mx: 'auto', px: 2, py: 3 }}>
            <Button component={Link} to="/laws" variant="outlined" sx={{ mb: 2 }}>
                ← Quay lại danh sách
            </Button>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>{law.title}</Typography>
                <Typography variant="subtitle1" gutterBottom>
                    <b>Số hiệu:</b> {law.lawNumber}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                    <b>Ngày ban hành:</b> {formatDate(law.issuedDate)}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                    <b>Cơ quan ban hành:</b> {law.metadata?.issuer}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    {law.rawHtml ? (
                        <div
                            style={{ fontSize: 16, lineHeight: 1.7 }}
                            dangerouslySetInnerHTML={{
                                __html: highlightText(law.rawHtml, search)
                            }}
                        />
                    ) : (
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}
                            dangerouslySetInnerHTML={{
                                __html: highlightText(law.contentText, search)
                            }}
                        />
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default LawDetail;
