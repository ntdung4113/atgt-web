import { useState, useCallback } from 'react';
import axios from 'axios';

export default function useMockTest(token) {
    const [questions, setQuestions] = useState([]);
    const [duration, setDuration] = useState(0);
    const [minCorrect, setMinCorrect] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMockTest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/questions/mock-test', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(res.data.data);
            setDuration(res.data.duration);
            setMinCorrect(res.data.min_correct);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return { questions, duration, minCorrect, isLoading, error, fetchMockTest };
} 