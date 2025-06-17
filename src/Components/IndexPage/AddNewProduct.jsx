import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddNewProduct.css"

export default function AddNewProduct() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/add-new-product");
  };

  return (
    <div className="add-product-card">
      <div className="add-product-content">
        <h2>Dodaj nowy produkt</h2>
        <p className="admin-note">Tylko dla administratorów</p>
        <button className="add-product-button" onClick={handleClick}>
          + Dodaj produkt
        </button>
      </div>
    </div>
  );
}
