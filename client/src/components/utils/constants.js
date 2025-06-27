export const LICENSES = ['A1', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D2', 'D', 'BE', 'C1E', 'CE', 'D1E', 'D2E', 'DE'];

export const LICENSE_INFO = {
    A1: { count: 25, min: 21, time: 19 },
    A: { count: 25, min: 23, time: 19 },
    B1: { count: 25, min: 23, time: 19 },
    B: { count: 30, min: 27, time: 20 },
    C1: { count: 35, min: 32, time: 22 },
    C: { count: 40, min: 36, time: 24 },
    D1: { count: 45, min: 41, time: 26 },
    D2: { count: 45, min: 41, time: 26 },
    D: { count: 45, min: 41, time: 26 },
    BE: { count: 45, min: 41, time: 26 },
    C1E: { count: 45, min: 41, time: 26 },
    CE: { count: 45, min: 41, time: 26 },
    D1E: { count: 45, min: 41, time: 26 },
    D2E: { count: 45, min: 41, time: 26 },
    DE: { count: 45, min: 41, time: 26 },
};

export const TOPIC_LIST = [
    { value: null, label: 'Tất cả chủ đề' },
    { value: 1, label: 'Quy định chung và quy tắc giao thông đường bộ' },
    { value: 2, label: 'Văn hóa giao thông, đạo đức người lái xe, kỹ năng phòng cháy, chữa cháy và cứu hộ, cứu nạn' },
    { value: 3, label: 'Kỹ thuật lái xe' },
    { value: 4, label: 'Cấu tạo và sửa chữa' },
    { value: 5, label: 'Báo hiệu đường bộ' },
    { value: 6, label: 'Giải thế sa hình và kỹ năng xử lý tình huống giao thông' },
    { value: 7, label: 'Câu điểm liệt' }
];

export const SIGN_TAGS = [
    { value: 'Biển báo cấm', label: 'Biển báo cấm' },
    { value: 'Biển báo nguy hiểm', label: 'Biển báo nguy hiểm' },
    { value: 'Biển báo hiệu lệnh', label: 'Biển báo hiệu lệnh' },
    { value: 'Biển báo chỉ dẫn', label: 'Biển báo chỉ dẫn' },
    { value: 'Biển báo phụ', label: 'Biển báo phụ' },
    { value: 'Vạch kẻ đường', label: 'Vạch kẻ đường' },
]; 

export const DOCUMENT_TYPES = ['Luật', 'Nghị định', 'Thông tư'];

export const VEHICLE_TYPE_ORDER = [
    'Xe máy',
    'Ô tô',
    'Phương tiện khác'
];

export const VIOLATION_TOPIC_ORDER = [
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