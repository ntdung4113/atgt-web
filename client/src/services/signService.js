import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export const signService = {
    getAllSigns: async (page = 1, limit = 20) => {
        const response = await axios.get(`${BASE_URL}/api/signs?page=${page}&limit=${limit}`);
        return response.data;
    },

    getSignsByTag: async (tag, page = 1, limit = 20) => {
        const response = await axios.get(`${BASE_URL}/api/signs/tag/${tag}?page=${page}&limit=${limit}`);
        return response.data;
    }
}; 