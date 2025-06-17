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
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
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

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                picture,
                role: 'user'
            });
        } else if (!user.googleId) {
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