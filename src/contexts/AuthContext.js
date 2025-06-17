import { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react'; // Dodaj useCallback
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

    // --- Memoizowane funkcje (przekazane do AuthContext i używane w useEffect) ---

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
    }, [navigate]); // navigate jest stabilne

    // Memoizujemy funkcję odświeżania tokena
    const refreshAccessToken = useCallback(async () => {
        const currentRefreshToken = refreshTokenRef.current;
        if (!currentRefreshToken) {
            console.warn("Brak refresh tokena, nie można odświeżyć. Wylogowuję.");
            logout(); // Wyloguj, jeśli nie ma refresh tokena
            return null;
        }

        try {
            console.log("Próba odświeżenia tokena...");
            const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: currentRefreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("access_token", data.access);
                setAccessToken(data.access);
                console.log("Token odświeżony pomyślnie.");
                return data.access;
            } else {
                console.error("Nie udało się odświeżyć tokena. Status:", response.status, await response.json());
                logout(); // Jeśli refresh token jest niepoprawny lub wygasł, wyloguj
                return null;
            }
        } catch (error) {
            console.error("Błąd sieci podczas odświeżania tokena:", error);
            logout();
            return null;
        }
    }, [logout]); // Zależy od funkcji logout

    // Memoizujemy funkcję pobierania użytkownika
    const fetchUser = useCallback(async (tokenToUse) => {
        setLoadingUser(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/user/", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${tokenToUse}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 401) { // Token access wygasł
                console.log("Błąd 401 podczas pobierania użytkownika, odświeżam token...");
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    // Ponów żądanie z nowym tokenem
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
                    logout(); // Wyloguj, jeśli odświeżanie się nie powiodło
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
            // Nie wylogowujemy od razu w przypadku błędu sieci,
            // bo to może być tymczasowy problem. Wylogowanie nastąpi,
            // gdy refreshAccessToken zawiedzie.
        } finally {
            setLoadingUser(false);
        }
    }, [refreshAccessToken, logout]); // Zależy od memoizowanych funkcji refreshAccessToken i logout


    // --- Effecty ---

    // Inicjalizacja tokenów z localStorage przy ładowaniu aplikacji
    useEffect(() => {
        const savedAccessToken = localStorage.getItem("access_token");
        const savedRefreshToken = localStorage.getItem("refresh_token");

        if (savedAccessToken && savedRefreshToken) {
            setAccessToken(savedAccessToken);
            setRefreshToken(savedRefreshToken);
            setIsLoggedIn(true);
        } else {
            setLoadingUser(false); // Jeśli nie ma tokenów, nie ładujemy użytkownika
        }
    }, []); // Pusta tablica zależności, uruchamia się tylko raz po zamontowaniu

    // Logika login
    const login = useCallback((newAccess, newRefresh) => {
      if (newAccess && newRefresh) {
        localStorage.setItem('access_token', newAccess);
        localStorage.setItem('refresh_token', newRefresh);
        setAccessToken(newAccess);
        setRefreshToken(newRefresh);
        setIsLoggedIn(true);
        setLoadingUser(true);          // 👈
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
    }, []); // Pusta tablica zależności, uruchamia się tylko raz

    // Automatyczne pobieranie danych użytkownika na podstawie tokena
    useEffect(() => {
        if (!accessToken) {
            setUser(null);
            setLoadingUser(false);
            return;
        }

        // Jeśli accessToken jest dostępny, spróbuj pobrać użytkownika
        fetchUser(accessToken);

    }, [accessToken, fetchUser]); // Zależy od access tokena i memoizowanej funkcji fetchUser


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
    return context;
};

