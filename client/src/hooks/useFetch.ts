import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface UseFetchOptions {
    initialFetch?: boolean; // Whether to fetch on mount
    dependencies?: any[]; // Dependencies to refetch
}

interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching data from API
 * @param endpoint - API endpoint to fetch from
 * @param options - Configuration options
 * @returns Object containing data, loading state, error, and refetch function
 * 
 * @example
 * const { data: posts, loading, error, refetch } = useFetch<Post[]>('/posts');
 */
function useFetch<T = any>(
    endpoint: string,
    options: UseFetchOptions = {}
): UseFetchReturn<T> {
    const { initialFetch = true, dependencies = [] } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(initialFetch);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(endpoint);
            setData(response.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            console.error(`Failed to fetch from ${endpoint}:`, err);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        if (initialFetch) {
            fetchData();
        }
    }, [fetchData, initialFetch, ...dependencies]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}

export default useFetch;
