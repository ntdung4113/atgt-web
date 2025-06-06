import React, { useState, useEffect } from 'react';
import { postService } from '../services/postService';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Button,
    Pagination,
    CircularProgress,
    Alert,
    Stack,
    Link,
    Dialog,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import CloseIcon from '@mui/icons-material/Close';

const StyledCard = styled(Card)(({ theme }) => ({
    width: 340,
    minHeight: 420,
    borderRadius: 16,
    boxShadow: theme.shadows[1],
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'box-shadow 0.2s, border 0.2s, transform 0.2s',
    background: '#fff',
    cursor: 'pointer',
    '&:hover': {
        boxShadow: theme.shadows[4],
        borderColor: theme.palette.primary.main,
        transform: 'translateY(-4px) scale(1.03)'
    }
}));

const ThumbnailBox = styled(Box)(({ theme }) => ({
    width: 280,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    boxShadow: theme.shadows[2]
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 12,
    background: '#000'
}));

const AuthorLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.primary.main,
    textDecoration: 'none',
    marginBottom: theme.spacing(1),
    fontWeight: 500,
    '&:hover': {
        textDecoration: 'underline'
    }
}));

const ContentText = styled(Typography)(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    height: '4.8em',
    lineHeight: '1.6em',
    marginBottom: theme.spacing(1.5),
    textAlign: 'center',
    color: theme.palette.text.primary
}));

const TagsContainer = styled(Stack)(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
    minHeight: '32px',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    justifyContent: 'center'
}));

const ActionButton = styled(Button)(({ theme }) => ({
    height: '44px',
    textTransform: 'none',
    fontSize: '1rem',
    marginTop: theme.spacing(2),
    borderRadius: 8,
    fontWeight: 600
}));

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [open, setOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await postService.getPosts({
                page,
                status: 'approved',
                limit: 9
            });
            setPosts(response.data);
            setTotalPages(Math.ceil(response.total / response.limit));
            setError(null);
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleOpen = (videoUrl) => {
        setSelectedVideo(videoUrl);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedVideo(null);
    };

    if (loading && posts.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', py: 4, background: '#fff' }}>
            <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ color: 'primary.main', fontWeight: 700, mb: 3, letterSpacing: 1 }}
            >
                Tình huống giao thông
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Grid container spacing={3} justifyContent="center">
                {posts.map((post) => (
                    <Grid item key={post._id} xs={12} sm={6} md={4} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <StyledCard>
                            <ThumbnailBox onClick={() => handleOpen(post.video_url)}>
                                <StyledCardMedia
                                    component="img"
                                    image={post.thumbnail_url || '/placeholder.jpg'}
                                    alt={post.content || 'Bài viết'}
                                    loading="lazy"
                                />
                            </ThumbnailBox>
                            <CardContent sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                                <AuthorLink
                                    href={post.author?.link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FacebookIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {post.author?.name || 'Ẩn danh'}
                                    </Typography>
                                </AuthorLink>
                                <ContentText variant="body2">
                                    {post.content || 'Không có nội dung'}
                                </ContentText>
                                <TagsContainer direction="row" useFlexGap>
                                    {post.tags?.length > 0 ? (
                                        post.tags.map((tag, index) => (
                                            <Chip
                                                key={index}
                                                label={tag}
                                                size="small"
                                                color="primary"
                                            />
                                        ))
                                    ) : (
                                        <Chip label="Không có thẻ" size="small" />
                                    )}
                                </TagsContainer>
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    href={`https://facebook.com/${post.post_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    disabled={!post.post_id}
                                >
                                    Xem bài viết
                                </ActionButton>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>
            {totalPages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        size="large"
                    />
                </Box>
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
                {selectedVideo && (
                    <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}>
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: 'grey.700',
                                zIndex: 1
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                        }}>
                            <video
                                src={selectedVideo}
                                controls
                                autoPlay
                                style={{ width: '100%', height: '100%', borderRadius: 12, background: '#000' }}
                            />
                        </Box>
                    </Box>
                )}
            </Dialog>
        </Box>
    );
};

export default PostList;