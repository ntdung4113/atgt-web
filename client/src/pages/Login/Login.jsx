import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../components/hooks/useAuth';
import LoginForm from '../../components/ui/Login/LoginForm';

const Login = () => {
    const { login, authError, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from || '/';
    const [oauthError, setOauthError] = useState(null);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await login({ credential: credentialResponse.credential });
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    const handleGoogleError = (error) => {
        console.error('Google OAuth error occurred:', error);
        setOauthError('Đăng nhập bằng Google không thành công. Vui lòng thử lại sau.');
    };

    return (
        <LoginForm
            loading={loading}
            authError={authError}
            oauthError={oauthError}
            onGoogleSuccess={handleGoogleSuccess}
            onGoogleError={handleGoogleError}
            onBackHome={() => navigate('/')}
        />
    );
};

export default Login;
