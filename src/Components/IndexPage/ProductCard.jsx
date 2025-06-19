import React, { useCallback, useState } from "react";
import useSearchFilters from "../../Hooks/useSearchFilters";
import { ReactComponent as FavoriteIcon } from "../../icons/favourite.svg";
import { ReactComponent as DeleteIcon } from "../../icons/delete.svg";
import { ReactComponent as EditIcon } from "../../icons/edit.svg";
import "../styles/ProductCart.css";
import { useAuth } from "../../contexts/AuthContext";
import useApi from "../../pages/utils/api";

import ConfirmModal from "./ConfirmModal";

// Dodaj 'onProductDeleted' do propsów
const ProductCard = ({ product, handleAddToCart, user, onProductDeleted }) => {
  const { setCategory, setAuthor } = useSearchFilters();
  const { token } = useAuth();
  const { authFetch } = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [productNameToDelete, setProductNameToDelete] = useState('')

  const handleDeleteClick = useCallback((productId, productName) => {
    setProductIdToDelete(productId);
    setProductNameToDelete(productName)
    setIsModalOpen(true);
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
            Authorization: `Bearer ${token}`,
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
  }, [token, authFetch, onProductDeleted, productIdToDelete]);

  const cancelDelete = useCallback(() => {
    setIsModalOpen(false);
    setProductIdToDelete(null); 
  }, []);

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
            {" "}
            {/* Nowy kontener */}
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
                      onClick={() => console.log("Edit clicked")}
                    >
                      <EditIcon />
                    </button>
                  </>
                )}

              <button
                className="icon-button"
                onClick={() => console.log("Favourite clicked")}
              >
                <FavoriteIcon />
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
