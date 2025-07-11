import styles from "./styles/UserProducts.module.css";

import Header from "../Components/Header";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ConfirmModal from "../Components/IndexPage/ConfirmModal";
import useApi from "./utils/api";
import AddNewProduct from "../Components/IndexPage/AddNewProduct";

export default function UserProducts() {
  const { authFetch } = useApi();
  const [products, setProducts] = useState([]);
  const { accessToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [productIdToToggle, setProductIdToToggle] = useState(null);
  const [productNameToToggle, setProductNameToToggle] = useState("");

  const fetchProducts = useCallback(() => {
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
      })
      .catch((error) => {
        console.error("Błąd użytkownika:", error);
        setLoading(false);
      });
  }, [user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEditClick = useCallback((productId) => {
    navigate(`/edit-product/${productId}`);
  }, [navigate]);

  const handleToggleClick = useCallback((productId, productName) => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    setProductIdToToggle(productId);
    setProductNameToToggle(productName);
    setIsModalOpen(true);
  }, [accessToken, navigate]);

  const confirmToggle = useCallback(async () => {
    setIsModalOpen(false);

    try {
      const response = await authFetch(
        `http://127.0.0.1:8000/api/store/product/${productIdToToggle}/toggle/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        await fetchProducts(); // pobranie aktualnych danych
        setProductIdToToggle(null); // reset
      } else {
        const errorData = await response.json();
        console.error("Błąd:", errorData);
      }
    } catch (error) {
      console.error("Wystąpił błąd sieci lub inny błąd:", error);
    }
  }, [authFetch, productIdToToggle, accessToken, fetchProducts]);

  const cancelToggle = useCallback(() => {
    setIsModalOpen(false);
    setProductIdToToggle(null);
  }, []);

  return (
    <>
      <Header />

      <div className={`${styles.container} ${styles['user-products-container']}`}> 
        <h1 className={styles['user-products-title']}>Twoje produkty</h1>

        {loading ? (
          <div className={styles.loading}>Ładowanie produktów...</div>
        ) : (
          <div className={styles['products-list']}>
            <AddNewProduct/>
            {products && products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className={`${styles['product-card']} ${!product.available ? styles.deleted : ''}`}
                >
                  <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img
                      src={`http://127.0.0.1:8000${product.image}`}
                      alt={product.name}
                      className={styles['product-image']}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div className={styles['product-info']}>
                    <h2 className={styles['product-name']}>{product.name}</h2>
                    <p className={styles['product-description']}>{product.description}</p>
                    <p className={styles['product-price']}>{product.price} zł</p>
                    <div className={styles.buttons}>
                      {product.available ? (
                        <>
                          <button className={`${styles.btn} ${styles.edit}`} onClick={() => handleEditClick(product.id)}>Edytuj</button>
                          <button className={`${styles.btn} ${styles.delete}`} onClick={() => handleToggleClick(product.id, product.name)}>Usuń</button>
                        </>
                      ) : (
                        <button className={`${styles.btn} ${styles.restore}`} onClick={() => handleToggleClick(product.id, product.name)}>Przywróć</button>
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

        <ConfirmModal
          isOpen={isModalOpen}
          message={`Czy na pewno chcesz ${products.find(p => p.id === productIdToToggle)?.available ? 'usunąć' : 'przywrócić'} produkt "${productNameToToggle}"?`}
          onConfirm={confirmToggle}
          onCancel={cancelToggle}
        />
      </div>
    </>
  );
}
