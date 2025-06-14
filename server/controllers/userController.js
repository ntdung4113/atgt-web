const User = require('../models/User');

exports.updateLicense = async (req, res) => {
    try {
        const { license } = req.body;

        if (!license) {
            return res.status(400).json({
                success: false,
                message: 'License không được để trống'
            });
        }

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