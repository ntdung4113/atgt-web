import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

function AdminImportLaw() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/api/admin/import-law`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi import');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>Import Văn bản pháp luật</Typography>
            <input type="file" accept=".html" onChange={handleFileChange} />
            <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleUpload}
                disabled={loading || !file}
            >
                {loading ? <CircularProgress size={24} /> : 'Tải lên & Import'}
            </Button>
            {result && <Alert severity="success" sx={{ mt: 2 }}>Import thành công!</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
    );
}

export default AdminImportLaw; 