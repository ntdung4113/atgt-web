import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';

const CollectModal = ({ open, onClose, onCollect }) => {
    const [groupUrl, setGroupUrl] = useState('');
    const [cookies, setCookies] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [maxVideos, setMaxVideos] = useState(3);
    const [scrollTimeout, setScrollTimeout] = useState(5);

    const handleCollect = async () => {
        try {
            const url = new URL(groupUrl);
            if (!url.hostname.includes('facebook.com')) {
                setError('Vui lòng nhập đúng URL nhóm Facebook');
                return;
            }
        } catch {
            setError('Vui lòng nhập đúng URL nhóm Facebook');
            return;
        }
        if (!cookies) {
            setError('Vui lòng chọn file cookies');
            return;
        }
        if (isNaN(maxVideos) || maxVideos < 1 || maxVideos > 5) {
            setError('Số video tối đa phải từ 1 đến 5');
            return;
        }
        if (isNaN(scrollTimeout) || scrollTimeout < 1 || scrollTimeout > 10) {
            setError('Thời gian tối đa phải từ 1 đến 10 phút');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await onCollect(groupUrl, cookies, maxVideos, scrollTimeout);
            setLoading(false);
            onClose();
            setToast({ open: true, message: 'Thu thập video thành công!', severity: 'success' });
        } catch (err) {
            setLoading(false);
            onClose();
            setToast({ open: true, message: err?.message || 'Thu thập thất bại', severity: 'error' });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.name.endsWith('.json')) {
                setError('Chỉ chấp nhận file cookies định dạng .json');
                setCookies(null);
                return;
            }
            setCookies(file);
            setError('');
        }
    };

    const handleCloseToast = () => setToast({ ...toast, open: false });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: 22, color: 'primary.main', textAlign: 'center', pb: 1 }}>
                Thu thập video từ nhóm Facebook
            </DialogTitle>
            <DialogContent sx={{ pt: 2, pb: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        value={groupUrl}
                        onChange={e => setGroupUrl(e.target.value)}
                        fullWidth
                        error={!!error && error.includes('URL')}
                        helperText={error && error.includes('URL') ? error : 'Nhập đường dẫn (URL) nhóm Facebook muốn thu thập video.'}
                        autoFocus
                        sx={{ mb: 2 }}
                        size="small"
                    />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, width: '100%' }}>
                        <TextField
                            label="Số video tối đa"
                            type="number"
                            size="small"
                            value={maxVideos}
                            onChange={e => setMaxVideos(Number(e.target.value))}
                            inputProps={{ min: 1, max: 5 }}
                            sx={{ flex: 1 }}
                            fullWidth
                        />
                        <TextField
                            label="Thời gian tối đa (phút)"
                            type="number"
                            size="small"
                            value={scrollTimeout}
                            onChange={e => setScrollTimeout(Number(e.target.value))}
                            inputProps={{ min: 1, max: 10 }}
                            sx={{ flex: 1 }}
                            fullWidth
                        />
                    </Box>
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ mb: 1, py: 1, fontWeight: 500, fontSize: 15 }}
                        disabled={loading}
                    >
                        {cookies ? cookies.name : 'Chọn file cookies (.json)'}
                        <input
                            type="file"
                            accept=".json"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    {error && !error.includes('URL') && (
                        <Typography color="error" variant="caption">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading} sx={{ fontWeight: 500 }}>
                    Huỷ
                </Button>
                <Box sx={{ position: 'relative' }}>
                    <Button
                        onClick={handleCollect}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ minWidth: 110, fontWeight: 600, fontSize: 16, borderRadius: 2, textTransform: 'none', py: 1 }}
                    >
                        Thu thập
                    </Button>
                    {loading && (
                        <CircularProgress size={24} sx={{ color: 'primary.main', position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />
                    )}
                </Box>
            </DialogActions>
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default CollectModal; 