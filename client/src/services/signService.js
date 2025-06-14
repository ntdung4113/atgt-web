import axios from 'axios';

const BASE_URL = '/api/signs';

export const signService = {
    getAllSigns: async (page = 1, limit = 20) => {
        const response = await axios.get(`${BASE_URL}?page=${page}&limit=${limit}`);
        return response.data;
    },

    getSignsByTag: async (tag, page = 1, limit = 20) => {
        const response = await axios.get(`${BASE_URL}/tag/${tag}?page=${page}&limit=${limit}`);
        return response.data;
    }
}; 