import React, { useState, useRef, useLayoutEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Chip,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Avatar,
    Link
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    LocalOffer as LocalOfferIcon,
    VideoLibrary as VideoLibraryIcon,
    Facebook as FacebookIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSituationManagement } from '../../components/hooks/useSituationManagement';
import ApproveModal from '../../components/ui/Situation/ApproveModal';
import TagModal from '../../components/ui/Situation/TagModal';
import CollectModal from '../../components/ui/Situation/CollectModal';
import VideoDialog from '../../components/ui/Situation/VideoDialog';
import { situationService } from '../../services/situationService';
import Pagination from '@mui/material/Pagination';

const SituationManagement = () => {
    const navigate = useNavigate();
    const {
        situations,
        loading,
        error,
        page,
        totalPages,
        setPage,
        pendingVideos,
        pendingPage,
        pendingTotalPages,
        setPendingPage,
        handleApprove,
        handleDecline,
        handleUpdateTags,
        handleCollectVideo,
        handleDelete
    } = useSituationManagement();

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSituation, setSelectedSituation] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [collectModalOpen, setCollectModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        tags: []
    });
    const [selectedSituationDetail, setSelectedSituationDetail] = useState(null);
    const [loadingTags, setLoadingTags] = useState(false);
    const [sortStatus, setSortStatus] = useState('none');
    const scrollYRef = useRef(null);

    useLayoutEffect(() => {
        if (scrollYRef.current !== null) {
            window.scrollTo(0, scrollYRef.current);
            scrollYRef.current = null;
        }
    }, [situations]);

    const handleMenuOpen = (event, situation) => {
        setAnchorEl(event.currentTarget);
        setSelectedSituation(situation);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleTagModalClose = () => {
        setTagModalOpen(false);
        setSelectedSituationDetail(null);
    };

    const handleEditClick = () => {
        if (selectedSituation) {
            setEditForm({
                title: selectedSituation.title,
                description: selectedSituation.description,
                tags: selectedSituation.tags
            });
            setEditModalOpen(true);
        }
        handleMenuClose();
    };

    const handleVideoClick = (videoUrl) => {
        setSelectedVideo(videoUrl);
        setVideoDialogOpen(true);
    };

    const handleCloseVideo = () => {
        setVideoDialogOpen(false);
        setSelectedVideo(null);
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            pending: { color: 'warning', label: 'Chờ duyệt' },
            approved: { color: 'success', label: 'Đã duyệt' },
            declined: { color: 'error', label: 'Từ chối' }
        };

        const config = statusConfig[status] || { color: 'default', label: status };

        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
            />
        );
    };

    const allTags = Array.from(new Set(
        situations.flatMap(s => s.tags || [])
    ));

    const handleOpenTagModal = async (situation) => {
        setTagModalOpen(true);
        setLoadingTags(true);
        try {
            const detail = await situationService.getSituationById(situation._id);
            setSelectedSituationDetail(detail);
        } catch (err) {
            setSelectedSituationDetail(situation); 
        }
        setLoadingTags(false);
    };

    const handleSortStatus = () => {
        setSortStatus(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleEditSave = () => {
        if (selectedSituation) {
            setEditModalOpen(false);
            handleUpdateTags(selectedSituation._id, editForm.tags);
        }
    };

    const sortedSituations = React.useMemo(() => {
        let filtered = situations.filter(situation => situation.status !== 'pending');
        if (sortStatus === 'asc') {
            return [...filtered].sort((a, b) => a.status.localeCompare(b.status));
        } else if (sortStatus === 'desc') {
            return [...filtered].sort((a, b) => b.status.localeCompare(a.status));
        }
        return filtered;
    }, [situations, sortStatus]);

    if (loading) return <Typography>Đang tải...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1, mb: 0 }}
                >
                    Quản lý tình huống giao thông
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setApproveModalOpen(true)}
                        sx={{ borderRadius: 2, fontWeight: 600, fontSize: 16, px: 3, boxShadow: 1, textTransform: 'none', whiteSpace: 'nowrap', minWidth: 140 }}
                    >
                        Duyệt video
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setCollectModalOpen(true)}
                        sx={{ borderRadius: 2, fontWeight: 600, fontSize: 16, px: 3, boxShadow: 1, textTransform: 'none', bgcolor: 'secondary.main', color: '#fff', '&:hover': { bgcolor: 'secondary.dark' }, whiteSpace: 'nowrap', minWidth: 140 }}
                    >
                        Thu thập video
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell width="120px" sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', border: 0 }}></TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', border: 0 }}>Nội dung</TableCell>
                            <TableCell width="200px" sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', border: 0 }}>Tác giả</TableCell>
                            <TableCell width="100px" sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', border: 0, whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }} onClick={handleSortStatus}>
                                Trạng thái
                                {sortStatus === 'asc' && <span style={{ marginLeft: 4 }}>▲</span>}
                                {sortStatus === 'desc' && <span style={{ marginLeft: 4 }}>▼</span>}
                            </TableCell>
                            <TableCell width="80px" sx={{ border: 0 }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedSituations.map((situation) => (
                            <TableRow
                                key={situation._id}
                                hover
                                sx={{
                                    '&:hover': { bgcolor: 'grey.50' },
                                    transition: 'background 0.2s',
                                    borderBottom: '1px solid #eee'
                                }}
                            >
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
                                        onClick={() => handleVideoClick(situation.video_url)}
                                    >
                                        <img
                                            src={situation.thumbnail_url || '/placeholder.jpg'}
                                            alt={situation.content}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, px: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: 15 }}>
                                        {situation.content}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {situation.tags?.map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: 13, borderRadius: 1, color: 'primary.main', borderColor: 'primary.light', bgcolor: 'primary.50' }}
                                            />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, px: 2 }}>
                                    <Link
                                        href={situation.author?.link || '#'}
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
                                            {situation.author?.name || 'Ẩn danh'}
                                        </Typography>
                                        <FacebookIcon sx={{ color: '#1877f2', fontSize: 20, ml: 0.5 }} />
                                    </Link>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, px: 2 }}>
                                    {getStatusChip(situation.status)}
                                </TableCell>
                                <TableCell sx={{ py: 1.5, px: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, situation)
                                        }
                                        sx={{ borderRadius: 2, color: 'grey.700', '&:hover': { bgcolor: 'grey.100', color: 'primary.main' } }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                        size="large"
                    />
                </Box>
            )}

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {selectedSituation && selectedSituation.status === 'declined' && (
                    <MenuItem onClick={async () => {
                        scrollYRef.current = window.scrollY;
                        await handleApprove(selectedSituation._id);
                        handleMenuClose();
                    }}>
                        <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                        Phê duyệt
                    </MenuItem>
                )}
                {selectedSituation && selectedSituation.status === 'approved' && (
                    <MenuItem onClick={async () => {
                        scrollYRef.current = window.scrollY;
                        await handleDecline(selectedSituation._id);
                        handleMenuClose();
                    }}>
                        <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                        Từ chối
                    </MenuItem>
                )}
                <MenuItem onClick={async () => {
                    handleMenuClose();
                    setTimeout(() => handleOpenTagModal(selectedSituation), 100);
                }}>
                    <LocalOfferIcon fontSize="small" sx={{ mr: 1 }} />
                    Quản lý tag
                </MenuItem>
            </Menu>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Chỉnh sửa tình huống</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tiêu đề"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Mô tả"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditModalOpen(false)}>Huỷ</Button>
                    <Button onClick={handleEditSave} variant="contained">
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modals */}
            <ApproveModal
                open={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                onApprove={handleApprove}
                onDecline={handleDecline}
                videos={pendingVideos}
                page={pendingPage}
                totalPages={pendingTotalPages}
                onPageChange={setPendingPage}
            />

            {tagModalOpen && selectedSituationDetail && !loadingTags && (
                <TagModal
                    open={tagModalOpen}
                    onClose={handleTagModalClose}
                    tags={allTags}
                    selectedTags={selectedSituationDetail?.tags || []}
                    onSave={async (tags) => {
                        if (selectedSituationDetail) {
                            scrollYRef.current = window.scrollY;
                            await handleUpdateTags(selectedSituationDetail._id, tags);
                            const detail = await situationService.getSituationById(selectedSituationDetail._id);
                            setSelectedSituationDetail(detail);
                        }
                    }}
                />
            )}

            <CollectModal
                open={collectModalOpen}
                onClose={() => setCollectModalOpen(false)}
                onCollect={handleCollectVideo}
            />

            <VideoDialog
                open={videoDialogOpen}
                onClose={handleCloseVideo}
                videoUrl={selectedVideo}
            />
        </Container>
    );
};

export default SituationManagement; 