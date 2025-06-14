import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const situationService = {
    getSituations: async ({ page = 1, limit = 9, status = 'approved', tags = [] }) => {
        try {
          const response = await axios.get(`${API_URL}/api/situations/public`, {
            params: {
              page,
              limit,
              status,
              tags: tags.length > 0 ? tags.join(',') : undefined 
            }
          });
          return response.data;
        } catch (error) {
          console.error('Error fetching situations:', error.response?.data || error.message);
          throw new Error(error.response?.data?.error || 'Failed to fetch situations');
        }
      },
    getAllTags: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/situations/tags`);
            const tags = response.data.tags;
            return tags;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 