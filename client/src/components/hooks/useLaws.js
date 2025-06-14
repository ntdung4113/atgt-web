import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lawService } from '../../services/lawService';
import { useDebounce } from './useDebounce';

export const useLaws = () => {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        setPage(1);
    }, [type, debouncedSearch]);

    const {
        data,
        isLoading,
        error
    } = useQuery({
        queryKey: ['laws', { type, page, search: debouncedSearch }],
        queryFn: async () => {
            if (debouncedSearch && debouncedSearch.trim() !== '') {
                return lawService.searchLaws(debouncedSearch, type, page);
            }
            return lawService.getAllLaws(type, page);
        },
        keepPreviousData: true
    });

    const displayedLaws = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return {
        search,
        setSearch,
        type,
        setType,
        page,
        setPage,
        displayedLaws,
        totalPages,
        isLoading,
        error
    };
};

export const useLawDetail = (lawNumber) => {
    const { data: law, isLoading, error } = useQuery({
        queryKey: ['lawDetail', lawNumber],
        queryFn: () => lawService.getLawDetail(lawNumber)
    });

    return {
        law,
        isLoading,
        error
    };
}; 