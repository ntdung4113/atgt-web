import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, TextField } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

function AdminImportLawFromUrl() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleImport = async () => {
        if (!url) return;
        setLoading(true);
        setResult(null);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/api/admin/import-law-url`, { url });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi import');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>Import VBPL từ link web</Typography>
            <TextField
                fullWidth
                label="Nhập link văn bản pháp luật"
                value={url}
                onChange={e => setUrl(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button
                variant="contained"
                onClick={handleImport}
                disabled={loading || !url}
            >
                {loading ? <CircularProgress size={24} /> : 'Import từ link'}
            </Button>
            {result && <Alert severity="success" sx={{ mt: 2 }}>Import thành công!</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
    );
}

export default AdminImportLawFromUrl; 