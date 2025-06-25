import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const situationService = {
  getCheckedSituations: async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/situations/checked`, { params });
    return response.data;
  },

  getPendingSituations: async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/situations/pending`, { params });
    return response.data;
  },

  getApprovedSituations: async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/situations/public`, { params });
    return response.data;
  },

  getAllTags: async () => {
    const response = await axios.get(`${API_URL}/api/situations/tags`);
    return response.data.tags;
  },

  updateStatus: async (id, status) => {
    const response = await axios.patch(`${API_URL}/api/situations/${id}/status`, { status });
    return response.data;
  },

  updateTags: async (id, tags) => {
    const response = await axios.patch(`${API_URL}/api/situations/${id}/tags`, { tags });
    return response.data;
  },

  collectVideos: async (groupUrl, cookiesFile, maxVideos = 5, scrollTimeout = 10) => {
    const formData = new FormData();
    formData.append('groupUrl', groupUrl);
    formData.append('cookies', cookiesFile);
    formData.append('maxVideos', maxVideos);
    formData.append('scrollTimeout', scrollTimeout);

    const response = await axios.post(`${API_URL}/api/situations/crawl`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getSituationById: async (id) => {
    const response = await axios.get(`${API_URL}/api/situations/${id}`);
    return response.data;
  },
}
