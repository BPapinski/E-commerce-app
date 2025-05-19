import "./styles/style.css";
import "./styles/reset.css";
import "./styles/register.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import { useState } from "react";


export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email,
      password,
      date_of_birth: dateOfBirth,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Użytkownik zarejestrowany!");
        setEmail("");
        setPassword("");
        setDateOfBirth("");
        setError(null);
      } else {
        // Obsługa błędów walidacji
        if (data.email) {
          setError("Email: " + data.email.join(" "));
        } else if (data.password) {
          setError("Hasło: " + data.password.join(" "));
        } else if (data.date_of_birth) {
          setError("Data urodzenia: " + data.date_of_birth.join(" "));
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Wystąpił nieznany błąd.");
        }
      }
    } catch (err) {
      console.error("Błąd sieci:", err);
      setError("Błąd połączenia z serwerem.");
    }
  };

  return (
    <div className="container">
      <Header />
      <Subheader />
      <div className="main-register">
        <div className="register-flex-item"></div>
        <div className="register-box">
          <h2>Rejestracja</h2>

          {error && (
            <div className="register-alert">
              {error}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Hasło"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="date"
              placeholder="Data urodzenia"
              className="input-field"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
            <button type="submit" className="register-button">
              Zarejestruj się
            </button>
          </form>
        </div>
        <div className="register-flex-item"></div>
      </div>
    </div>
  );
}


