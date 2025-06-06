import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const fetchPendingPosts = async () => {
  const res = await axios.get('/api/posts?status=pending');
  return res.data;
};

const PostApproval = () => {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', 'pending'],
    queryFn: fetchPendingPosts
  });

  const handleApprove = async (id, status) => {
    await axios.patch(`/api/posts/${id}/status`, { status });
    queryClient.invalidateQueries(['posts', 'pending']);
    setMessage(status === 'approved' ? 'Đã duyệt bài viết!' : 'Đã từ chối bài viết!');
    setTimeout(() => setMessage(''), 2000);
  };

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Duyệt bài viết</h2>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {posts.length === 0 && <div>Không có bài viết chờ duyệt.</div>}
      {posts.map(post => (
        <div key={post._id} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 8 }}>
          <a href={post.postUrl} target="_blank" rel="noopener noreferrer">{post.description}</a>
          <button onClick={() => handleApprove(post._id, 'approved')} style={{ marginLeft: 8 }}>Duyệt</button>
          <button onClick={() => handleApprove(post._id, 'declined')} style={{ marginLeft: 8 }}>Từ chối</button>
        </div>
      ))}
    </div>
  );
};

export default PostApproval;