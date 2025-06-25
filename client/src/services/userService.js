import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const updateUserLicense = async (license) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        const response = await axios.put(
            `${API_URL}/api/users/update-license`,
            { license },
            config
        );

        localStorage.setItem('userLicense', license);

        return response.data.data;
    } catch (error) {
        console.error('Error updating user license:', error);

        localStorage.setItem('userLicense', license);

        throw error;
    }
};

export const getCurrentUser = async (token) => {
    try {
        if (!token) return null;

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const response = await axios.get(`${API_URL}/api/users/me`, config);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};