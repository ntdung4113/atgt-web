import { useState, useEffect } from 'react';
import { signService } from '../../services/signService';

const LIMIT = 20;

export const useSigns = () => {
    const [signs, setSigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pendingTag, setPendingTag] = useState(null);

    useEffect(() => {
        setPage(1);
    }, [selectedTag]);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        }
    }, [totalPages, page]);

    useEffect(() => {
        if (pendingTag !== null) return;
        setLoading(true);

        const fetchSigns = async () => {
            try {
                const data = selectedTag
                    ? await signService.getSignsByTag(selectedTag, page, LIMIT)
                    : await signService.getAllSigns(page, LIMIT);

                setSigns(Array.isArray(data.data) ? data.data : data);
                setTotalPages(data.totalPages || 1);
            } catch (error) {
                console.error('Error fetching signs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSigns();
    }, [selectedTag, page, pendingTag]);

    useEffect(() => {
        if (pendingTag !== null && page === 1) {
            setSelectedTag(pendingTag);
            setPendingTag(null);
        }
    }, [pendingTag, page]);

    const handleTagChange = (tag) => {
        if (page !== 1) {
            setPendingTag(tag);
            setPage(1);
        } else {
            setSelectedTag(tag);
        }
    };

    return {
        signs,
        loading,
        selectedTag,
        page,
        totalPages,
        handleTagChange,
        setPage
    };
}; 