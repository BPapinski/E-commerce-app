import { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Funkcja pomocnicza do sprawdzania, czy token wygasł (na podstawie daty 'exp' w JWT)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (e) {
    console.error("Błąd dekodowania tokena:", e);
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // Ustaw na true, ponieważ będziemy próbować załadować użytkownika

  const navigate = useNavigate();

  // Używamy useRef, aby mieć dostęp do najnowszych tokenów w funkcji refresh
  const accessTokenRef = useRef(accessToken);
  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
    refreshTokenRef.current = refreshToken;
  }, [accessToken, refreshToken]);

  // Memoizujemy funkcję logout, aby była stabilna
  const logout = useCallback(() => {
    console.log("Wylogowywanie użytkownika...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAccessToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);
    setUser(null);
    setLoadingUser(false); // Ustaw na false po wylogowaniu
    navigate("/login");
  }, [navigate]);

  // Memoizujemy funkcję odświeżania tokena
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.error('Brak refresh tokena, nie mogę odświeżyć. Pozwalam na przeglądanie.');
      return null; // Zwróć null, zamiast wylogowywać użytkownika
    }

    const response = await fetch('/api/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Błąd podczas próby odświeżenia tokenu');
      return null;
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access); // Zapisz nowy token
    return data.access;
  };

  

  // Inicjalizacja tokenów z localStorage przy ładowaniu aplikacji
  useEffect(() => {
    const savedAccessToken = localStorage.getItem("access_token");
    const savedRefreshToken = localStorage.getItem("refresh_token");

    if (savedAccessToken && savedRefreshToken) {
      setAccessToken(savedAccessToken);
      setRefreshToken(savedRefreshToken);
      setIsLoggedIn(true);
    } else {
      setLoadingUser(false); // Jeśli nie ma tokenów, po prostu kończymy ładowanie
    }
  }, []);

  // Logika login
  const login = useCallback((newAccess, newRefresh) => {
    if (newAccess && newRefresh) {
      localStorage.setItem('access_token', newAccess);
      localStorage.setItem('refresh_token', newRefresh);
      setAccessToken(newAccess);
      setRefreshToken(newRefresh);
      setIsLoggedIn(true);
      setLoadingUser(true);  // Rozpocznij ładowanie
      navigate('/');
    }
  }, [navigate]);

  // Nasłuchiwanie zmian w localStorage (np. z innych zakładek)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        const currentAccessToken = localStorage.getItem("access_token");
        const currentRefreshToken = localStorage.getItem("refresh_token");
        setAccessToken(currentAccessToken);
        setRefreshToken(currentRefreshToken);
        setIsLoggedIn(!!currentAccessToken);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Automatyczne pobieranie danych użytkownika na podstawie tokena
  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/user/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          console.log("Błąd 401 podczas pobierania użytkownika, odświeżam token...");
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            const retryRes = await fetch("http://127.0.0.1:8000/api/user/", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
                "Content-Type": "application/json",
              },
            });
            if (!retryRes.ok) throw new Error("Nie udało się pobrać danych użytkownika po odświeżeniu");
            const userData = await retryRes.json();
            setUser(userData);
          } else {
            logout();
          }
        } else if (!res.ok) {
          throw new Error("Nie udało się pobrać danych użytkownika");
        } else {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Błąd pobierania użytkownika:", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [accessToken]);

  const contextValue = {
    accessToken,
    refreshToken,
    isLoggedIn,
    login, // Memoizowana funkcja login
    logout, // Memoizowana funkcja logout
    user,
    loadingUser,
    refreshAccessToken, // Memoizowana funkcja odświeżania
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  console.log(context)
  return context;
};
