import "./styles/style.css";
import "./styles/reset.css";
import "./styles/login.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import Sidebar from "../Components/Sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";





export default function Login() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState()
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  function submitLogin(e){
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: login,
        password: password
      })
    })
    .then((res) => {
      if (res.ok) {
        setLoggedIn(true);
        return res.json();
      } else {
        throw new Error("Nieprawidłowe dane logowania");
      }
    })
    .then((data) => {
      localStorage.setItem("loggedIn", "true");
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      console.log("Zalogowano:", data);
      setLoggedIn(true)
      navigate("/");
    })
    .catch((err) => {
      console.error("Błąd logowania:", err);
    });
  } 


  return (
    <div className="container">
      <Header />
      <Subheader />
      <div className="main-login">
        <div className="login-flex-item"></div>
        <div className="login-box">
          <h2>Logowanie</h2>
          <form onSubmit={submitLogin} className="login-form">
            <input
              type="text"
              placeholder="Login"
              className="input-field"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Hasło" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              />
            <button type="submit" className="login-button">Zaloguj się</button>
          </form>
          <div className="social-login">
          <button class="login-with-google-btn">
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=" 
                  alt="Google Logo" class="google-logo"/>
              <span class="google-text">Zaloguj się przy użyciu Google</span>
          </button>
          <button class="login-with-apple-btn">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Logo" class="apple-logo"/>
            <span class="apple-text">Zaloguj się przez Apple</span>
          </button>
          </div>
          <div className="register-section">
            <span>Nie masz konta?</span>
            <button
              type="button"
              className="register-button"
              onClick={() => window.location.href = "/register"}
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
