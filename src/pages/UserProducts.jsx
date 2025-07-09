import styles from "./styles/UserProducts.css";
import Header from "../Components/Header";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserProducts() {

  const [products, setProducts] = useState(null)
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
  if (!user?.id) return;

  fetch(`http://127.0.0.1:8000/api/store/userproducts/${user.id}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Nie udało się pobrać danych produktów");
      return res.json();
    })
    .then((productsData) => {
      setProducts(productsData);
      setLoading(false);
      console.log(productsData);
    })
    .catch((error) => {
      console.error("Błąd użytkownika:", error);
      setLoading(false);  
    });

    
}, [user?.id]);

   const handleEditClick = useCallback((productId) => {
      navigate(`/edit-product/${productId}`);
    }, []);

   return (
    <>
      <Header />
      <div className="container user-products-container">
        <h1 className="user-products-title">Twoje produkty</h1>

        {loading ? (
          <div className="loading">Ładowanie produktów...</div>
        ) : (
          <div className="products-list">
            {products && products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className={`product-card ${product.deleted ? "deleted" : ""}`}
                >
                  <img
                    src={`http://127.0.0.1:8000${product.image}`}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h2 className="product-name">{product.name}</h2>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">{product.price} zł</p>
                    <div className="buttons">
                      {product.available ? (
                        <>
                          <button className="btn edit" onClick={()=>(handleEditClick(product.id))}>Edytuj</button>
                          <button className="btn delete">Usuń</button>
                        </>
                      ) : (
                        <button className="btn restore">Przywróć</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>Brak produktów do wyświetlenia.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
