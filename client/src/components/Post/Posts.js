import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Typography, Chip, Box, Stack, CardActionArea, Alert, CircularProgress } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;

const fetchPosts = async () => {
  console.log('Fetching posts from:', `${API_URL}/api/posts?status=approved`);
  const res = await fetch(`${API_URL}/api/posts?status=approved`);
  if (!res.ok) {
    throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  console.log('API response:', data);
  return data;
};

const Posts = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', 'approved'],
    queryFn: fetchPosts,
    retry: 2, // Thử lại 2 lần nếu thất bại
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  const posts = data?.data || [];

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Đang tải bài viết...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 3 }}>
        <Alert severity="error">
          Không thể tải bài viết: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bài viết tình huống giao thông
      </Typography>
      {posts.length === 0 ? (
        <Typography>Chưa có bài viết nào.</Typography>
      ) : (
        <Stack spacing={2}>
          {posts.map((post) => (
            <Card key={post._id} variant="outlined">
              <CardActionArea
                component="a"
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'block' }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main' }}>
                    {post.description || 'Không có mô tả'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                  {post.tags && post.tags.length > 0 && (
                    <ul>
                    <Box mt={1}>
                      {post.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </Box>
                    </ul>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Posts;