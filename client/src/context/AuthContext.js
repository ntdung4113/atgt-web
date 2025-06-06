import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();
export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null); // <-- Thêm token
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState(null);

    // Kiểm tra xác thực khi load trang
    useEffect(() => {
        const check = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const userData = await authService.checkAuth();
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        check();
    }, [token]);

    const login = async (googleData) => {
        setAuthError(null);
        setLoading(true);
        try {
            const { user, token } = await authService.login(googleData);

            localStorage.setItem('token', token);     // Lưu vào localStorage
            setToken(token);                          // Lưu vào context
            setUser(user);
            setIsAuthenticated(true);
            return user;
        } catch (error) {
            let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
            if (error.response) {
                if (error.response.status === 500) {
                    errorMessage = 'Lỗi server. Vui lòng liên hệ quản trị viên.';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setAuthError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        localStorage.removeItem('token');  // Xoá token khỏi localStorage
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
    };

    const updateUserInfo = async (updatedData) => {
        try {
            const updated = await authService.updateUserInfo(updatedData);
            setUser(prev => ({ ...prev, ...updated }));
            return updated;
        } catch (error) {
            throw error;
        }
    };

    const updateLicense = async (license) => {
        try {
            const updated = await authService.updateLicense(license);
            setUser(prev => prev ? { ...prev, license } : prev);
            return updated;
        } catch (error) {
            throw error;
        }
    };

    const checkTokenValidity = async () => {
        const valid = await authService.checkTokenValidity();
        if (!valid) {
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
        return valid;
    };

    const contextValue = {
        token,               // <-- Truyền token trong context
        user,
        loading,
        isAuthenticated,
        authError,
        login,
        logout,
        updateUserInfo,
        updateLicense,
        checkTokenValidity
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
