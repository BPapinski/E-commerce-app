import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import { useParams } from "react-router-dom";
import "./styles/productPage.css";

export default function ProductPage() {
  const { id } = useParams();
  const { accessToken, isLoggedIn } = useAuth();
  const [productData, setProductData] = useState();
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/store/product/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nie udało się pobrać danych produktu");
        return res.json();
      })
      .then((productData) => {
        setProductData(productData);
        console.log(productData);
      })
      .catch((error) => {
        console.error("Błąd użytkownika:", error);
      });
  }, [id]);

  if (!productData) {
    return (
      <div className="container">
        <Header />
        <Subheader />
        <div className="loading">Ładowanie produktu...</div>
      </div>
    );
  }
  return (
    <div className="container">
      <Header />
      <Subheader />
      <div className="showcase-container">
        <div className="product-left">
          <div className="image-wrapper">
            <img
              src={productData.image}
              alt={productData.name}
              className="product-img"
            />
          </div>
        </div>

        <div className="product-right">
          <h1 className="product-title">{productData.name}</h1>
          <p className="product-category">{productData.category}</p>
          <p className="product-description">{productData.description}</p>
          <p className="product-price">{productData.price} zł</p>
          {productData.available ? (
            isLoggedIn ? (
              <button
                className="buy-button"
                onClick={async () => {
                  setAddError("");
                  try {
                    const res = await fetch("http://127.0.0.1:8000/api/store/cart/add/", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                      },
                      body: JSON.stringify({ product_id: productData.id, quantity: 1 }),
                    });
                    if (!res.ok) {
                      if (res.status === 401) throw new Error("Musisz być zalogowany, aby dodać do koszyka.");
                      throw new Error("Nie udało się dodać do koszyka");
                    }
                    alert("Dodano do koszyka!");
                  } catch (e) {
                    setAddError(e.message);
                  }
                }}
              >
                Dodaj do koszyka
              </button>
            ) : (
              <span className="product-unavailable">Zaloguj się, aby dodać do koszyka</span>
            )
          ) : (
            <span className="product-unavailable">Produkt niedostępny</span>
          )}
          {addError && (
            <div style={{ color: "#b94a4a", marginTop: "0.5rem" }}>{addError}</div>
          )}
        </div>
      </div>
    </div>
  );
}
