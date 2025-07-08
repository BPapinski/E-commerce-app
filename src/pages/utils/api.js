// utils/api.js  (zamień plik na ten)

import { useAuth } from '../../contexts/AuthContext';
import { useRef } from 'react';

// pomocniczo – sprawdzamy czy JWT wygasł
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp < Date.now() / 1000 - 10;        // 10 s margines
  } catch {
    return true;
  }
};

const useApi = () => {
  const { accessToken, logout, refreshAccessToken } = useAuth();

  const isRefreshing = useRef(false);
  const failedQueue  = useRef([]);

  const processQueue = (error, token = null) => {
    failedQueue.current.forEach(p => (error ? p.reject(error) : p.resolve(token)));
    failedQueue.current = [];
  };

  const authFetch = async (url, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (!('Authorization' in headers) && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Sprawdź, czy token jest wygasły przed wysłaniem zapytania
  if (accessToken && isTokenExpired(accessToken)) {
    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
      // Jeśli nie uda się odświeżyć tokenu, przekieruj na stronę logowania
      logout();
      window.location.href = '/login'; // lub navigate('/login');
      return;
    }
    headers.Authorization = `Bearer ${newAccessToken}`;
  }

  try {
    let response = await fetch(url, { ...options, headers });

    // Obsługuje sytuację, gdy token już wygasł i jest konieczność jego odświeżenia
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        logout();
        window.location.href = '/login'; // lub navigate('/login');
        return;
      }
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    }

    return response;
  } catch (err) {
    console.error('authFetch error:', err);
    throw err;
  }
};

    return { authFetch };
  };

export default useApi;
