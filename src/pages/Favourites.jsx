import React, { useEffect, useState } from "react";
import styles from "./styles/UserProducts.module.css";
import Header from "../Components/Header";
import { useAuth } from "../contexts/AuthContext";

export default function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const { accessToken, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!accessToken || !isLoggedIn) return;
    fetch("http://127.0.0.1:8000/api/store/favourite/list/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFavourites(data.favourites || []);
      })
      .catch(() => setFavourites([]));
  }, [accessToken, isLoggedIn]);

  return (
    <>
      <Header />
      <div className={styles["user-products-container"]}>
        <h1 className={styles["user-products-title"]}>Ulubione produkty</h1>
        <div className={styles["products-list"]}>
          {favourites.length > 0 ? (
            favourites.map((product) => (
              <div key={product.id} className={styles["product-card"]}>
                <img
                  src={`http://127.0.0.1:8000${product.image}`}
                  alt={product.name}
                  className={styles["product-image"]}
                />
                <div className={styles["product-info"]}>
                  <h2 className={styles["product-name"]}>
                    <a href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {product.name}
                    </a>
                  </h2>
                  <p className={styles["product-description"]}>{product.description}</p>
                  <p className={styles["product-price"]}>{product.price} zł</p>
                </div>
              </div>
            ))
          ) : (
            <div>Brak ulubionych produktów.</div>
          )}
        </div>
      </div>
    </>
  );
}
