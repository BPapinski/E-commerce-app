// src/hooks/useAuth.js (lub src/context/AuthContext.js - nazwa pliku jest ważna, ale zawartość jest kluczowa)

import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();

  const login = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setIsLoggedIn(true);
      navigate("/"); // Przekierowanie po loginie
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  // Nasłuchiwanie zmian w localStorage (np. z innych zakładek)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        const currentToken = localStorage.getItem("token");
        setToken(currentToken);
        setIsLoggedIn(!!currentToken);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Automatyczne pobieranie danych użytkownika na podstawie tokena
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);

    fetch("http://127.0.0.1:8000/api/user/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nie udało się pobrać danych użytkownika");
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
      })
      .catch((err) => {
        console.error("Błąd pobierania użytkownika:", err);
        setUser(null);
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, [token]);

  const contextValue = {
    token,
    isLoggedIn,
    login,
    logout,
    user,
    loadingUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
