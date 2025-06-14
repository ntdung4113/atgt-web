import { useQuery } from '@tanstack/react-query';

const useFetch = (queryKey, queryFn, options = {}) => {
    return useQuery({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
        queryFn,
        ...options,
    });
};

export default useFetch;
