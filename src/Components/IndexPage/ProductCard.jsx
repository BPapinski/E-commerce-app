import React, { useCallback } from "react";
import useSearchFilters from "../../Hooks/useSearchFilters";
import { ReactComponent as FavoriteIcon } from "../../icons/favourite.svg";
import { ReactComponent as DeleteIcon } from "../../icons/delete.svg";
import { ReactComponent as EditIcon } from "../../icons/edit.svg";
import "../styles/ProductCart.css";
import { useAuth } from "../../contexts/AuthContext";
import useApi from "../../pages/utils/api";

// Dodaj 'onProductDeleted' do propsów
const ProductCard = ({ product, handleAddToCart, user, onProductDeleted }) => {
    const { setCategory, setAuthor } = useSearchFilters();
    const { token } = useAuth();
    const { authFetch } = useApi();

    const handleDeleteProduct = useCallback(async (productId) => {
        try {
            const response = await authFetch(
                `http://127.0.0.1:8000/api/store/product/${productId}/delete/`,
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
                    console.log("Produkt usunięty pomyślnie (204 No Content).");
                    // <--- KLUCZOWA ZMIANA: Wywołaj funkcję z nadrzędnego komponentu
                    if (onProductDeleted) {
                        onProductDeleted(productId);
                    }
                } else {
                    const data = await response.json();
                    console.log(data);
                    alert("ok");
                }
            } else {
                const errorData = await response.json();
                console.error("Błąd:", errorData);
                alert(`Wystąpił błąd: ${errorData.detail || errorData.message || "Nieznany błąd"}`);
            }
        } catch (error) {
            console.error("Wystąpił błąd sieci lub inny błąd:", error);
            alert("Wystąpił błąd podczas komunikacji z serwerem.");
        }
    }, [token, authFetch, onProductDeleted]); // <--- Dodaj zależności do useCallback

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
                                            onClick={() => handleDeleteProduct(product.id)}
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
        </div>
    );
};

export default ProductCard;