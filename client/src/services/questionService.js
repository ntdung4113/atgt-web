import axios from 'axios';

const API_URL = '/api/questions';

export const getPracticeQuestions = async (token, { topic }) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    let url = `${API_URL}/license-questions`;
    if (topic) {
        url += `?topic=${topic}`;
    }
    const res = await axios.get(url, config);
    return res.data;
};

export const checkPracticeAnswers = async (token, answers) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const res = await axios.post('/api/questions/check-answers', { answers }, config);
    return res.data;
}; 