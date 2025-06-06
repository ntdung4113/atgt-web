const User = require('../models/User'); // Đảm bảo import User model

// Thêm hàm để cập nhật license
exports.updateLicense = async (req, res) => {
    try {
        const { license } = req.body;

        if (!license) {
            return res.status(400).json({
                success: false,
                message: 'License không được để trống'
            });
        }

        console.log('Updating license for user:', req.user.id, 'to:', license);

        // Tìm và cập nhật user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { license },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating license:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật license',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Thêm hàm để lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};