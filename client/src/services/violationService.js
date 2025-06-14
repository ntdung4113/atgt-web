import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const violationService = {
    getAllViolations: async ({ vehicle_type = '', topic = '', search = '', page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (vehicle_type) params.append('vehicle_type', vehicle_type);
        if (topic) params.append('topic', topic);
        if (search) params.append('q', search);
        params.append('page', page);
        params.append('limit', limit);
        const res = await axios.get(`${API_URL}/api/traffic-violations?${params.toString()}`);
        return res.data;
    },

    getViolationFilters: async () => {
        const res = await axios.get(`${API_URL}/api/traffic-violations/filters`);
        return res.data;
    }
}; 