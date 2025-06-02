import "./styles/style.css";
import "./styles/reset.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import Sidebar from "../Components/Sidebar";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function IndexPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Ustaw token z localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Pobierz dane użytkownika, jeśli token jest
  useEffect(() => {
    if (!token) return;

    fetch("http://127.0.0.1:8000/api/profile/", {
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
      .catch((error) => {
        console.error("Błąd użytkownika:", error);
      });
  }, [token]);

  // Dynamiczne filtrowanie produktów na podstawie URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");

    let apiUrl = "http://127.0.0.1:8000/api/store/";
    const queryParams = new URLSearchParams();
    if (category) queryParams.append("category", category);
    if ([...queryParams].length > 0) {
      apiUrl += "?" + queryParams.toString();
    }

    fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Błąd podczas pobierania produktów");
        return res.json();
      })
      .then((data) => {
        setProducts(data.results || data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Nie udało się pobrać produktów.");
      });
  }, [location.search]); // <- reaguje na zmiany w URL

  return (
    <div className="container">
      <Header user={user} />
      <Subheader />
      <div className="main">
        <Sidebar />
        <div className="content">
          {error && <div className="error">{error}</div>}

          {products.map((product, index) => (
            <div key={index} className="product">
              <div className="product-image">
                <img src={`${product.image}`} alt={product.name} />
              </div>
              <div className="product-data">
                <div className="product-info">
                  <h2 className="product-name" style={{ fontSize: "1.8rem" }}>
                    <a href="#">{product.name}</a>
                  </h2>
                  <h2 className="category" style={{ fontSize: "1rem" }}>{product.category}</h2>
                  <h2 style={{ color: "white", fontSize: "1rem", paddingTop: "1em" }}>
                    {product.condition}
                  </h2>
                </div>
                <div className="product-placeholder"></div>
                <div className="product-price">
                  <h2 style={{ color: "white", fontSize: "1.2rem" }}>{product.price}zł</h2>
                  <button style={{ marginTop: "0.5em" }}>Kup</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
