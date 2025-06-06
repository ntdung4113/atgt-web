import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const postService = {
    // Lấy danh sách posts với filter
    getPosts: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/api/posts`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật status của post
    updatePostStatus: async (postId, status) => {
        try {
            const response = await axios.patch(`${API_URL}/posts/${postId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật tags của post
    updatePostTags: async (postId, tags) => {
        try {
            const response = await axios.patch(`${API_URL}/posts/${postId}/tags`, { tags });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy tất cả tags
    getAllTags: async () => {
        try {
            const response = await axios.get(`${API_URL}/posts/tags`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 