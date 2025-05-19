import "./styles/style.css";
import "./styles/reset.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import Sidebar from "../Components/Sidebar";
import React, { useEffect, useState } from "react";

export default function IndexPage() {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/store/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Błąd podczas pobierania produktów');
        return res.json();
      })
      .then(data => {
        // Jeśli używasz paginacji DRF, dane będą w `data.results`
        setProducts(data.results || data);
      })
      .catch(err => {
        console.error(err);
        setError("Nie udało się pobrać produktów.");
      });
  }, [token]);


  return (
    <div className="container">
      <Header />
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
                  <h2 style={{ color: "white", fontSize: "1rem", paddingTop: "1em" }}>{product.condition}</h2>
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
