import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // 🧹 Czyszczenie danych logowania z localStorage
    localStorage.removeItem("token"); // jeśli token był zapisywany
    navigate("/login");
  }, 
  
  [navigate]);

  return null; // Komponent nie renderuje nic — tylko efekt
}
