const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kiểm tra middleware protect
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Lấy token từ header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Kiểm tra token tồn tại
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không có token xác thực'
            });
        }

        try {
            // Xác minh token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Thêm user vào request
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Người dùng không tồn tại'
                });
            }

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Simple middleware for backward compatibility with existing code
exports.auth = exports.protect;

// Middleware to authorize based on user role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng chưa được xác thực'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Quyền truy cập bị từ chối. Bạn không có quyền thực hiện thao tác này'
            });
        }

        next();
    };
};