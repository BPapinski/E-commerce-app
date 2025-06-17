import "./styles/style.css";
import "./styles/reset.css";
import "./styles/login.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import Sidebar from "../Components/Sidebar"; // Upewnij się, że Sidebar jest używany, jeśli nie, możesz usunąć
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Prawidłowa ścieżka do AuthContext

export default function Login() {
  const navigate = useNavigate();
  // Zmieniamy nazwę `login` z useAuth na `authLogin` (lub inną),
  // aby uniknąć konfliktu nazw ze stanem `login` komponentu.
  const { login: authLogin } = useAuth(); 

  const [email, setEmail] = useState("admin@email.com"); // Zmieniono nazwę na `email` dla jasności
  const [password, setPassword] = useState("Haslo123!");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Dodano stan ładowania dla przycisku

  // Funkcja do pokazywania/ukrywania alertu - teraz będzie sterowana stanem `loginErrorMessage`
  // Nie potrzebujemy już bezpośrednio manipulować DOM (`alertBox.classList.remove("hidden")`)
  // bo React będzie to renderować warunkowo.
  // Możesz usunąć tę funkcję, jeśli zarządzasz widocznością div.alert-box poprzez warunkowe renderowanie na podstawie loginErrorMessage.

  async function submitLogin(e) { // Zmieniono na funkcję asynchroniczną
    e.preventDefault();
    setLoginErrorMessage(""); // Czyścimy komunikat o błędzie przed nową próbą
    setIsLoading(true); // Rozpoczynamy ładowanie

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", { // Zmień na /api/token/ bo stąd otrzymujesz refresh i access token
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email, // Używamy `email`
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Oczekujemy, że API Simple JWT zwróci `access` i `refresh` tokeny
        if (data.access && data.refresh) {
          // Przekazujemy OBA tokeny do funkcji login z AuthContext
          authLogin(data.access, data.refresh); 
          // Po pomyślnym zalogowaniu, `authLogin` powinno samo obsługiwać nawigację (`Maps("/")`).
          // Dlatego nie wywołujemy `Maps` tutaj bezpośrednio.
        } else {
          // Jeśli API nie zwróciło obu tokenów, coś jest nie tak
          setLoginErrorMessage("Błąd serwera: Nie otrzymano wszystkich tokenów.");
        }
      } else {
        // Jeśli odpowiedź nie jest OK, spróbuj sparsować błąd z odpowiedzi
        const errorData = await response.json();
        // Wyświetl szczegółowy błąd z API, jeśli dostępny, w przeciwnym razie ogólny komunikat
        setLoginErrorMessage(errorData.detail || "Nieprawidłowy adres email lub hasło.");
        console.error("Błąd logowania:", errorData);
      }
    } catch (err) {
      console.error("Błąd sieci lub inny problem:", err);
      setLoginErrorMessage("Wystąpił problem z połączeniem. Spróbuj ponownie później.");
    } finally {
      setIsLoading(false); // Kończymy ładowanie, niezależnie od wyniku
    }
  }

  return (
    <div className="container">
      <Header />
      <Subheader />
      {/* <Sidebar />  Możesz odkomentować, jeśli Sidebar jest faktycznie potrzebny na stronie logowania */}
      <div className="main-login">
        <div className="login-flex-item"></div>
        <div className="login-box">
          <h2>Logowanie</h2>
          <form onSubmit={submitLogin} className="login-form">
            <input
              type="text"
              placeholder="Email" // Zmieniono na Email, bo używasz `email` w state
              className="input-field"
              value={email} // Zmieniono na `email`
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Hasło"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Logowanie..." : "Zaloguj się"} {/* Zmieniamy tekst przycisku podczas ładowania */}
            </button>
          </form>

          {/* Warunkowe renderowanie komunikatu o błędzie */}
          {loginErrorMessage && (
            <div className="alert-box"> {/* Usuwamy klasę "hidden" */}
              <div className="alert alert-danger">{loginErrorMessage}</div>
            </div>
          )}

          <div className="social-login">
            <button className="login-with-google-btn">
              <img
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4="
                alt="Google Logo"
                className="google-logo" // Zmieniono class na className
              />
              <span className="google-text">Zaloguj się przy użyciu Google</span> {/* Zmieniono class na className */}
            </button>
            <button className="login-with-apple-btn">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                alt="Apple Logo"
                className="apple-logo" // Zmieniono class na className
              />
              <span className="apple-text">Zaloguj się przez Apple</span> {/* Zmieniono class na className */}
            </button>
          </div>
          <div className="register-section">
            <span>Nie masz konta?</span>
            <button
              type="button"
              className="register-button"
              onClick={() => navigate("/register")} // Używamy `Maps` zamiast window.location.href
            >
              Zarejestruj się
            </button>
          </div>
        </div>
        <div className="login-flex-item"></div>
      </div>
    </div>
  );
}