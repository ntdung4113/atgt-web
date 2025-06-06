import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Lấy tất cả loại bằng lái
export const getAllLicenses = async () => {
    try {
        const res = await axios.get(`${API_URL}/api/licenses`);
        return res.data;
    } catch (error) {
        console.error('Error fetching licenses:', error);
        throw error;
    }
};

// Lấy câu hỏi theo loại bằng và áp dụng mapping
export const getAllQuestionsByLicense = async (params) => {
    try {
        // Chuẩn hóa license thành chữ hoa trước khi gửi request
        const normalizedParams = {
            ...params,
            license: params.license ? params.license.toUpperCase() : params.license
        };

        // Sử dụng URLSearchParams để tạo query string
        const queryParams = new URLSearchParams(normalizedParams).toString();
        const res = await axios.get(`${API_URL}/api/questions/license-questions?${queryParams}`);
        return res.data.data || []; // Trả về mảng rỗng nếu không có data
    } catch (error) {
        console.error('Error fetching questions by license:', error);
        // Xử lý lỗi cụ thể
        if (error.response && error.response.status === 404) {
            // Fallback: nếu không có API license-questions, thử dùng API thông thường
            try {
                const fallbackParams = new URLSearchParams(params).toString();
                const fallbackRes = await axios.get(`${API_URL}/api/questions/browse?${fallbackParams}`);
                return fallbackRes.data || [];
            } catch (fallbackError) {
                console.error('Error with fallback API:', fallbackError);
                throw fallbackError;
            }
        }
        throw error;
    }
};