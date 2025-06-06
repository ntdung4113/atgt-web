import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

export const VEHICLE_TYPE_ORDER = [
    'Xe máy',
    'Ô tô',
    'Phương tiện khác'
];

export const TOPIC_ORDER = [
    'Hiệu lệnh, chỉ dẫn',
    'Chuyển hướng, nhường đường',
    'Dừng xe, đỗ xe',
    'Thiết bị ưu tiên, còi',
    'Tốc độ, khoảng cách an toàn',
    'Vận chuyển người, hàng hóa',
    'Trang thiết bị phương tiện',
    'Đường cấm, đường một chiều',
    'Nồng độ cồn, chất kích thích',
    'Giấy tờ xe',
    'Khác'
];

export const fetchViolations = async ({ vehicle_type = '', topic = '', search = '', page = 1, limit = 10 }) => {
    const params = new URLSearchParams();
    if (vehicle_type) params.append('vehicle_type', vehicle_type);
    if (topic) params.append('topic', topic);
    if (search) params.append('q', search);
    params.append('page', page);
    params.append('limit', limit);
    const res = await axios.get(`${API_URL}/api/traffic-violations?${params.toString()}`);
    return res.data;
};

export const fetchViolationFilters = async () => {
    const res = await axios.get(`${API_URL}/api/traffic-violations/filters`);
    return res.data;
}; 