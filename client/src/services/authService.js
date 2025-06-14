import axios from 'axios';
import { getCurrentUser } from './userService';

const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

const TOKEN_KEY = 'token';

export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const login = async (googleData) => {
    const response = await axios.post('/api/auth/google', {
        credential: googleData.credential
    });
    if (!response.data || !response.data.token) {
        throw new Error('Token không hợp lệ từ server');
    }
    const { token, user } = response.data;
    setToken(token);
    setAuthToken(token);
    if (user.license) {
        localStorage.setItem('userLicense', user.license);
    }
    return { user, token };
};

export const logout = () => {
    removeToken();
    setAuthToken(null);
    localStorage.removeItem('userLicense');
};

export const checkAuth = async () => {
    const token = getToken();
    if (!token) return null;
    setAuthToken(token);
    try {
        const userData = await getCurrentUser(token);
        return userData;
    } catch {
        removeToken();
        return null;
    }
};

export const fetchUser = async () => {
    const response = await axios.get('/api/auth/me');
    return response.data.user;
};

export const updateUserInfo = async (updatedData) => {
    const token = getToken();
    if (!token) return null;
    setAuthToken(token);
    const response = await axios.patch('/api/users/me', updatedData);
    return response.data.data;
};

export const updateLicense = async (license) => {
    const token = getToken();
    if (!token) return null;
    setAuthToken(token);
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.put('/api/users/update-license', { license }, config);
    localStorage.setItem('userLicense', license);
    return response.data.data;
};

export const checkTokenValidity = async () => {
    const token = getToken();
    if (!token) return false;
    try {
        await axios.get('/api/auth/verify-token', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            removeToken();
        }
        return false;
    }
}; 