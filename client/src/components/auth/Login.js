import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Typography, Paper, Alert, Button, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
    const { login, authError, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from || '/';
    const [oauthError, setOauthError] = useState(null);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('Google login success, processing credential...');
            // Gửi credential trực tiếp đến server
            await login({
                credential: credentialResponse.credential
            });

            // Redirect to the original page after successful login
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Google login error:', error);
            // Error is now handled by AuthContext
        }
    };

    const handleGoogleError = (error) => {
        console.error('Google OAuth error occurred:', error);
        setOauthError('Đăng nhập bằng Google không thành công. Vui lòng thử lại sau.');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                p: 3
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: 400,
                    width: '100%'
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Đăng nhập
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Đăng nhập để lưu tiến trình học tập
                </Typography>

                {(authError || oauthError) && (
                    <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                        {authError || oauthError}
                    </Alert>
                )}

                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_blue"
                            size="large"
                            width="300"
                            useOneTap={false}
                        />
                    </>
                )}

                <Button
                    variant="text"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Quay lại trang chủ
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;