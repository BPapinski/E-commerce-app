import React, { useCallback } from "react";
import useSearchFilters from "../../Hooks/useSearchFilters";
import { ReactComponent as FavoriteIcon } from "../../icons/favourite.svg";
import { ReactComponent as DeleteIcon } from "../../icons/delete.svg";
import { ReactComponent as EditIcon } from "../../icons/edit.svg";
import "../styles/ProductCart.css";

const ProductCard = ({ product, handleAddToCart, user }) => {
  const { setCategory, setAuthor } = useSearchFilters();


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
  <div className="button-and-icons-wrapper"> {/* Nowy kontener */}
    <button
      style={{ marginTop: "0.5em" }}
      onClick={() => handleAddToCart(product.id)}
    >
      Dodaj do koszyka
    </button>
    <div className="product-icons">
      {user && (user.email === product.seller_email || user.is_admin) && (
        <>
          <button className="icon-button" onClick={() => console.log("Delete clicked")}>
            <DeleteIcon />
          </button>
          <button className="icon-button" onClick={() => console.log("Edit clicked")}>
            <EditIcon />
          </button>
        </>
      )}

    <button className="icon-button" onClick={() => console.log("Favourite clicked")}>
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
