import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import {
    Box,
    Typography,
    Paper,
    Alert,
    Button,
    CircularProgress,
} from '@mui/material';

const LoginForm = ({
    loading,
    authError,
    oauthError,
    onGoogleSuccess,
    onGoogleError,
    onBackHome,
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                p: 3,
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
                    width: '100%',
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
                    <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={onGoogleError}
                        theme="filled_blue"
                        size="large"
                        width="300"
                        useOneTap={false}
                    />
                )}

                <Button
                    variant="text"
                    onClick={onBackHome}
                    sx={{ mt: 2 }}
                >
                    Quay lại trang chủ
                </Button>
            </Paper>
        </Box>
    );
};

export default LoginForm;
