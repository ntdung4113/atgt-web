import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Cập nhật license của user
export const updateUserLicense = async (license) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        const response = await axios.put(
            `${API_URL}/api/users/update-license`,
            { license },
            config
        );

        // Lưu license vào localStorage để phòng trường hợp mất kết nối
        localStorage.setItem('userLicense', license);

        return response.data.data;
    } catch (error) {
        console.error('Error updating user license:', error);

        // Vẫn lưu vào localStorage ngay cả khi API thất bại
        localStorage.setItem('userLicense', license);

        throw error;
    }
};

// Lấy license từ localStorage
export const getSavedLicense = () => {
    return localStorage.getItem('userLicense') || localStorage.getItem('selectedLicense') || 'B1';
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async (token) => {
    try {
        if (!token) return null;

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const response = await axios.get(`${API_URL}/api/users/me`, config);
        // Lấy user từ response.data.data
        return response.data.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};