// src/hooks/useApi.js
// ─── Reusable data-fetching hooks ─────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic hook for any API call.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(cardAPI.getMyCards);
 */
export function useApi(apiFn, params = null, options = {}) {
  const { immediate = true, onSuccess, onError } = options;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async (callParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(callParams ?? params);
      const result = res.data?.data ?? res.data;
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        onError?.(err.message);
      }
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [apiFn, params]);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) execute();
    return () => { mountedRef.current = false; };
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute };
}

/**
 * Hook for paginated API calls.
 *
 * Usage:
 *   const { data, page, setPage, loading, total } = usePaginatedApi(transactionAPI.getAll);
 */
export function usePaginatedApi(apiFn, initialParams = {}, pageSize = 10) {
  const [page,    setPage]    = useState(1);
  const [filters, setFilters] = useState(initialParams);
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchPage = useCallback(async (p = page, f = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn({ ...f, page: p, page_size: pageSize });
      const payload = res.data?.data ?? res.data;
      const results = Array.isArray(payload) ? payload : payload?.results ?? [];
      setData(results);
      setTotal(payload?.count ?? results.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFn, page, filters, pageSize]);

  useEffect(() => { fetchPage(page, filters); }, [page, filters]);

  const updateFilters = (newFilters) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...newFilters }));
  };

  return { data, total, page, setPage, loading, error, filters, updateFilters, refetch: fetchPage };
}

/**
 * Hook for mutation (POST/PUT/PATCH/DELETE) with loading state.
 *
 * Usage:
 *   const { mutate, loading, error } = useMutation(cardAPI.freeze, {
 *     onSuccess: (data) => toast.success('Card frozen!'),
 *   });
 */
export function useMutation(apiFn, options = {}) {
  const { onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      const result = res.data?.data ?? res.data;
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err.message);
      onError?.(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { mutate, loading, error };
}