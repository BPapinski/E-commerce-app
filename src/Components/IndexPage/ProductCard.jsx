import React, { useCallback, useState, useEffect } from "react";
import useSearchFilters from "../../Hooks/useSearchFilters";
import { ReactComponent as FavoriteIcon } from "../../icons/favourite.svg";
import { ReactComponent as DeleteIcon } from "../../icons/delete.svg";
import { ReactComponent as EditIcon } from "../../icons/edit.svg";
import "../styles/ProductCart.css";
import { useAuth } from "../../contexts/AuthContext";
import useApi from "../../pages/utils/api";
import { useNavigate } from "react-router-dom";

import ConfirmModal from "./ConfirmModal";

// Dodaj 'onProductDeleted' do propsów
const ProductCard = ({ product, handleAddToCart, user, onProductDeleted }) => {
  const { setCategory, setAuthor } = useSearchFilters();
  const { accessToken } = useAuth();
  const { authFetch } = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [productNameToDelete, setProductNameToDelete] = useState("");
  const navigate = useNavigate();
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    console.log("useEffect wywołany dla produktu:", product.id);  // Sprawdzamy, czy useEffect jest wywoływany

    const checkIsFavourite = async () => {
      if (!accessToken) {
        setIsFavourite(false);  // Jeśli użytkownik nie jest zalogowany, ustawiamy false
        console.log("Brak tokenu, ustawiamy isFavourite na false");
        return;  // Pomijamy dalszą logikę
      }

      try {
        console.log("Wysyłam zapytanie o ulubione dla produktu:", product.id);
        const res = await authFetch(
          `http://127.0.0.1:8000/api/store/favourite/is_favourite/${product.id}/`
        );
        console.log("Odpowiedź z serwera:", res);  // Sprawdzamy odpowiedź serwera
        if (res.ok) {
          const data = await res.json();
          console.log("Odpowiedź API:", data);  // Logowanie odpowiedzi z API
          setIsFavourite(data.isFavourite);
        } else {
          setIsFavourite(false);
          console.log("Odpowiedź serwera:", res);
        }
      } catch (err) {
        console.error("Błąd ładowania ulubionych:", err);
        setIsFavourite(false);
      }
    };

    // Sprawdzamy, czy ID produktu jest dostępne i tylko wtedy uruchamiamy zapytanie
    if (product.id && accessToken) {
      checkIsFavourite();
    } else {
      console.log("Brak product.id lub tokenu, nie wykonano zapytania.");
    }
  }, [product.id, accessToken, authFetch]);  // Zależy od product.id, tokenu i authFetch

  const handleDeleteClick = useCallback((productId, productName) => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    setProductIdToDelete(productId);
    setProductNameToDelete(productName);
    setIsModalOpen(true);
  }, [accessToken, navigate]);

  const handleEditClick = useCallback((productId) => {
    navigate(`/edit-product/${productId}`);
  }, []);

  const confirmDelete = useCallback(async () => {
    setIsModalOpen(false);
    try {
      const response = await authFetch(
        `http://127.0.0.1:8000/api/store/product/${productIdToDelete}/delete/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        if (response.status === 204) {
          if (onProductDeleted) {
            onProductDeleted(productIdToDelete);
          }
        } else {
          const data = await response.json();
          console.log(data);
        }
      } else {
        const errorData = await response.json();
        console.error("Błąd:", errorData);
      }
    } catch (error) {
      console.error("Wystąpił błąd sieci lub inny błąd:", error);
    } finally {
      setProductIdToDelete(null);
    }
  }, [accessToken, authFetch, onProductDeleted, productIdToDelete]);

  const cancelDelete = useCallback(() => {
    setIsModalOpen(false);
    setProductIdToDelete(null);
  }, []);

  const handleFavouriteClick = useCallback(
    async (productId) => {
      if (!accessToken) {
        // Jeśli brak tokenu (niezalogowany użytkownik), przekieruj na stronę logowania
        navigate("/login");
        return;
      }

      try {
        if (isFavourite) {
          // Usuń z ulubionych
          const res = await authFetch(
            `http://127.0.0.1:8000/api/store/favourite/remove/${productId}/`,
            {
              method: "DELETE",
            }
          );
          if (res.ok) {
            setIsFavourite(false);
          } else {
            alert("Nie udało się usunąć z ulubionych");
          }
        } else {
          // Dodaj do ulubionych
          const res = await authFetch(
            `http://127.0.0.1:8000/api/store/favourite/add/${productId}/`,
            {
              method: "POST",
            }
          );
          if (res.ok) {
            setIsFavourite(true);
          } else {
            alert("Nie udało się dodać do ulubionych");
          }
        }
      } catch (err) {
        alert("Błąd połączenia z serwerem.");
      }
    },
    [isFavourite, authFetch, product.id, accessToken, navigate]
  );

  return (
    <div className="product">
      <div className="product-image">
        <img src={`${product.image}`} alt={product.name} />
      </div>
      <div className="product-data">
        <div className="product-info">
          <h2 className="product-name" style={{ fontSize: "1.8rem" }}>
            <a href={`/product/${product.id}`}>{product.name}</a>
          </h2>
          <h2
            className="category"
            style={{ fontSize: "1rem" }}
            onClick={() => setCategory(product.category_name)}
          >
            {product.category_name}
          </h2>
          <h2
            style={{
              color: "white",
              fontSize: "1rem",
              paddingTop: "1em",
            }}
          >
            {product.condition}
          </h2>
          <h2
            className="product-author"
            onClick={() => setAuthor(product.seller)}
          >
            sprzedawca: {product.seller_email}
          </h2>
        </div>
        <div className="product-placeholder"></div>
        <div className="product-price">
          <h2 style={{ color: "white", fontSize: "1.2rem" }}>
            {product.price}zł
          </h2>
          <div className="button-and-icons-wrapper">
            <button
              style={{ marginTop: "0.5em" }}
              onClick={() => handleAddToCart(product.id)}
            >
              Dodaj do koszyka
            </button>
            <div className="product-icons">
              {user &&
                (user.email === product.seller_email || user.is_admin) && (
                  <>
                    <button
                      className="icon-button"
                      onClick={() =>
                        handleDeleteClick(product.id, product.name)
                      }
                    >
                      <DeleteIcon />
                      {product.id}
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => handleEditClick(product.id)}
                    >
                      <EditIcon />
                    </button>
                  </>
                )}

              <button
                className="icon-button"
                onClick={() => handleFavouriteClick(product.id)}
              >
                {isFavourite ? (
                  <FavoriteIcon style={{ fill: "red" }} />
                ) : (
                  <FavoriteIcon />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        message={`Czy na pewno chcesz usunąć produkt "${productNameToDelete}"?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default ProductCard;
