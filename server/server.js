const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { pathErrorHandler } = require('./utils/routeUtils');
require('dotenv').config();

const app = express();

// CORS configuration - Updated to avoid path-to-regexp issues
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Thêm 'PATCH' vào methods
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Make sure all routes use the same CORS configuration
app.options('*', cors(corsOptions));

// Thêm headers để hỗ trợ Cross-Origin-Isolation và cho phép window.postMessage hoạt động
app.use((req, res, next) => {
    // Thiết lập Cross-Origin-Opener-Policy là "same-origin-allow-popups" thay vì "same-origin"
    // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Add middleware to catch path-to-regexp errors
app.use(pathErrorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/auth', require('./routes/auth'));

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const lawRoutes = require('./routes/law');
app.use('/api/laws', lawRoutes);

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

const signRoutes = require('./routes/signRoute');
app.use('/api/signs', signRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const trafficViolationRoutes = require('./routes/trafficViolation');
app.use('/api/traffic-violations', trafficViolationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
