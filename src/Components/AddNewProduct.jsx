import React from "react";
import { useNavigate } from "react-router-dom";


export default function AddNewProduct() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/add-new-product");
  };

  return (
    <div className="product add-new-product">
      <div className="product-image">
        <img src="/icons/add-product.svg" alt="Dodaj produkt" />
      </div>
      <div className="product-data">
        <div className="product-info">
          <h2 className="product-name">Dodaj nowy produkt</h2>
          <h2 style={{ fontSize: "1rem", color: "white" }}>Tylko dla administratorów</h2>
        </div>
        <div className="product-placeholder"></div>
        <div className="product-price">
          <button onClick={handleClick}>Przejdź do formularza</button>
        </div>
      </div>
    </div>
  );
}
