const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'yftf7sifsif',
        { expiresIn: '1d' }
    );
};

// Test login for Postman
exports.testLogin = async (req, res) => {
    try {
        const { email, name } = req.body;

        // Tìm hoặc tạo user
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                name,
                role: 'user'
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Test login error:', error);
        res.status(500).json({
            success: false,
            message: 'Test login failed'
        });
    }
};

exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'No credential provided'
            });
        }

        console.log('Received credential:', credential.substring(0, 20) + '...');

        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token payload'
            });
        }

        const { sub: googleId, email, name, picture } = payload;
        console.log('Token verified for:', email);

        // Tìm user theo googleId hoặc email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            // Nếu không tìm thấy user, tạo mới
            console.log('Creating new user for:', email);
            user = await User.create({
                googleId,
                email,
                name,
                picture,
                role: 'user'
            });
        } else if (!user.googleId) {
            // Nếu user tồn tại nhưng chưa có googleId, cập nhật
            console.log('Updating existing user:', email);
            user.googleId = googleId;
            user.picture = picture;
            await user.save();
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed: ' + error.message
        });
    }
};

// Trong hàm xử lý đăng nhập hoặc đăng ký
exports.googleLogin = async (req, res) => {
    try {
        // ... code xác thực Google ...

        // Tạo hoặc tìm user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                // ...các trường khác...
                // Thêm license mặc định nếu là người dùng mới
                license: 'B1'
            });
        }

        // Tạo token
        const token = user.getSignedJwtToken();

        // Trả về thông tin user (bao gồm license)
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                license: user.license, // Đảm bảo trả về license
                role: user.role
            }
        });
    } catch (error) {
        // ...xử lý lỗi...
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-googleId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user'
        });
    }
};