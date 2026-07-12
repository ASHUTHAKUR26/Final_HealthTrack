import { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

/**
 * Generic data fetching hook for any health endpoint
 * Usage: const { data, loading, error, refetch } = useHealthData('/health/sleep')
 */
export function useHealthData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    API.get(endpoint)
      .then(res => {
        // Handle both array responses and {data: [...]} shapes
        const result = Array.isArray(res.data) ? res.data : (res.data.data ?? res.data);
        setData(result);
        setError(null);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load data');
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for submitting health log forms
 * Usage: const { submit, loading, msg } = useSubmit('/health/sleep', refetch)
 */
export function useSubmit(endpoint, onSuccess) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const submit = useCallback(async (payload) => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await API.post(endpoint, payload);
      setMsg({ type: 'success', text: 'Saved successfully!' });
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) {
      const text = err.response?.data?.message || 'Something went wrong.';
      setMsg({ type: 'error', text });
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess]);

  const clearMsg = () => setMsg({ type: '', text: '' });

  return { submit, loading, msg, clearMsg };
}

/**
 * Auth state hook
 */
export function useAuth() {
  const user = JSON.parse(localStorage.getItem('hts_user') || '{}');
  const token = localStorage.getItem('hts_token');
  const isLoggedIn = !!token;

  function logout() {
    localStorage.removeItem('hts_token');
    localStorage.removeItem('hts_user');
    window.location.href = '/login';
  }

  return { user, token, isLoggedIn, logout };
}
