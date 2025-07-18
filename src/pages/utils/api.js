// utils/api.js

import { useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp < Date.now() / 1000 - 10;
  } catch {
    return true;
  }
};

const useApi = () => {
  const { accessToken, logout, refreshAccessToken } = useAuth();

  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  const processQueue = (error, token = null) => {
    failedQueue.current.forEach(p => (error ? p.reject(error) : p.resolve(token)));
    failedQueue.current = [];
  };

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = { ...(options.headers || {}) };
    let currentAccessToken = accessToken;

    if (currentAccessToken && isTokenExpired(currentAccessToken)) {
      if (!isRefreshing.current) {
        isRefreshing.current = true;
        try {
          const newAccessToken = await refreshAccessToken();
          currentAccessToken = newAccessToken;
          processQueue(null, newAccessToken);
        } catch (err) {
          processQueue(err);
          logout();
          window.location.href = '/login';
          throw new Error("Failed to refresh token, logging out.");
        } finally {
          isRefreshing.current = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.current.push({ resolve, reject });
        }).then(token => {
          headers.Authorization = `Bearer ${token}`;
          return fetch(url, { ...options, headers });
        }).catch(err => {
          throw err;
        });
      }
    }

    if (currentAccessToken) {
      headers.Authorization = `Bearer ${currentAccessToken}`;
    }

    try {
      let response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        if (isRefreshing.current) {
          return new Promise((resolve, reject) => {
            failedQueue.current.push({ resolve, reject });
          }).then(token => {
            headers.Authorization = `Bearer ${token}`;
            return fetch(url, { ...options, headers });
          }).catch(err => {
            throw err;
          });
        }

        isRefreshing.current = true;
        try {
          const newAccessToken = await refreshAccessToken();
          currentAccessToken = newAccessToken;
          processQueue(null, newAccessToken);
          headers.Authorization = `Bearer ${currentAccessToken}`;
          response = await fetch(url, { ...options, headers });
        } catch (err) {
          processQueue(err);
          logout();
          window.location.href = '/login';
          throw new Error("Failed to refresh token after 401, logging out.");
        } finally {
          isRefreshing.current = false;
        }
      }
      return response;
    } catch (err) {
      console.error('authFetch network error:', err);
      throw err;
    }
  }, [accessToken, logout, refreshAccessToken]);

  return { authFetch };
};

export default useApi;