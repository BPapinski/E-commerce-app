import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Tutaj możesz dodać dodatkową logikę np. usuwanie tokena z localStorage
    navigate("/login"); // Przekierowanie do strony logowania
  }, [navigate]);

  return null; // Komponent nie renderuje nic, ponieważ użytkownik jest przekierowywany
}