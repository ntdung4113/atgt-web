import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import LawDetailContent from '../../components/ui/Law/LawDetailContent';
import { useLawDetail } from '../../components/hooks/useLaws';

const LawDetail = () => {
    const { lawNumber } = useParams();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const search = params.get('q') || '';

    const { law, isLoading, error } = useLawDetail(lawNumber);

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
            <LawDetailContent law={law} search={search} />
        </Box>
    );
};

export default LawDetail; 