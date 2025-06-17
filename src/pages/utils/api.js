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
    // 1️⃣  Zbuduj nagłówki nie nadpisując Authorization, jeśli już jest:
    const headers = { ...(options.headers || {}) };
    if (!('Authorization' in headers) && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // 2️⃣  Jeśli token w stanie jest wygasły → spróbuj odświeżyć **przed** wysłaniem
    let finalHeaders = headers;
    if (headers.Authorization && isTokenExpired(headers.Authorization.split(' ')[1])) {
      const newTok = await refreshAccessToken();
      if (!newTok) {
        logout();
        throw new Error('Token refresh failed – logged out');
      }
      finalHeaders = { ...headers, Authorization: `Bearer ${newTok}` };
    }

    try {
      let response = await fetch(url, { ...options, headers: finalHeaders });

      if (response.status === 401 && url !== 'http://127.0.0.1:8000/api/token/refresh/') {
        if (isRefreshing.current) {
          return new Promise((resolve, reject) => {
            failedQueue.current.push({ resolve, reject });
          }).then(token => authFetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
          }));
        }

        isRefreshing.current = true;
        const newToken = await refreshAccessToken();
        isRefreshing.current = false;

        if (newToken) {
          processQueue(null, newToken);
          return fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
          });
        }
        processQueue(new Error('Token refresh failed'));
        logout();
        throw new Error('Token refresh failed – logged out');
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
