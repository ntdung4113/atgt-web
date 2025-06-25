import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Box,
    Avatar,
    Link,
    Paper,
    Chip,
    Pagination
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    PlayCircle as PlayCircleIcon,
    Facebook as FacebookIcon
} from '@mui/icons-material';

const ApproveModal = ({ open, onClose, onApprove, onDecline, videos = [], page = 1, totalPages = 1, onPageChange }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setVideoDialogOpen(true);
    };

    const handleCloseVideoDialog = () => {
        setVideoDialogOpen(false);
        setSelectedVideo(null);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 24, color: 'primary.main', pb: 1.5 }}>
                    Duyệt video
                </DialogTitle>
                <DialogContent sx={{ pt: 2, pb: 2 }}>
                    {videos.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', fontStyle: 'italic', color: 'text.secondary', fontSize: 16 }}>
                            Không có video nào cần duyệt
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                                        <TableCell width="120px" sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', border: 0 }}></TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', border: 0 }}>Nội dung</TableCell>
                                        <TableCell width="200px" sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', border: 0 }}>Tác giả</TableCell>
                                        <TableCell width="120px" sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', border: 0 }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {videos.map((video) => (
                                        <TableRow key={video._id} hover sx={{ '&:hover': { bgcolor: 'grey.50' }, transition: 'background 0.2s' }}>
                                            <TableCell sx={{ py: 1.5, px: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 100,
                                                        height: 60,
                                                        borderRadius: 1,
                                                        overflow: 'hidden',
                                                        cursor: 'pointer',
                                                        border: '1px solid #e0e0e0',
                                                        '&:hover': { opacity: 0.85, borderColor: 'primary.main' }
                                                    }}
                                                    onClick={() => handleVideoClick(video)}
                                                >
                                                    <img
                                                        src={video.thumbnail_url || '/placeholder.jpg'}
                                                        alt={video.content}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5, px: 2 }}>
                                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: 15 }}>
                                                    {video.content}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5, px: 2 }}>
                                                <Link
                                                    href={video.author?.link || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                        fontWeight: 500,
                                                        fontSize: 15
                                                    }}
                                                >
                                                    <Typography variant="body2">
                                                        {video.author?.name || 'Ẩn danh'}
                                                    </Typography>
                                                    <FacebookIcon sx={{ color: '#1877f2', fontSize: 20, ml: 0.5 }} />
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5, px: 2 }}>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => onApprove(video._id)}
                                                        size="small"
                                                        sx={{ borderRadius: 2, bgcolor: 'success.50', '&:hover': { bgcolor: 'success.100' } }}
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => onDecline(video._id)}
                                                        size="small"
                                                        sx={{ borderRadius: 2, bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {videos.length > 0 && totalPages > 1 && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => onPageChange(value)}
                                color="primary"
                                shape="rounded"
                                size="large"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} variant="outlined" color="primary" sx={{ borderRadius: 2, fontWeight: 600, fontSize: 16, px: 3, textTransform: 'none' }}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Video Dialog */}
            <Dialog
                open={videoDialogOpen}
                onClose={handleCloseVideoDialog}
                maxWidth="md"
                fullWidth
            >
                {selectedVideo && (
                    <>
                        <DialogTitle>{selectedVideo.content}</DialogTitle>
                        <DialogContent>
                            <Box sx={{ mt: 2 }}>
                                <video
                                    controls
                                    style={{ width: '100%', maxHeight: '70vh' }}
                                    src={selectedVideo.video_url}
                                />
                                <Box sx={{ mt: 2 }}>
                                    <Typography component="div" variant="body1">
                                        {selectedVideo.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 2, flexWrap: 'wrap' }}>
                                        {selectedVideo.tags?.map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseVideoDialog}>Đóng</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};

export default ApproveModal; 