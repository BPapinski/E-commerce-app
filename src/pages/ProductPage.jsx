import { useEffect, useState } from "react";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import { useParams } from "react-router-dom";
import "./styles/productPage.css"

export default function ProductPage(){
    const { id } = useParams();

    const [productData, setProductData] = useState();

    useEffect(() =>{
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
                console.log(productData)
            })
            .catch((error) => {
                console.error("Błąd użytkownika:", error);
            });
    }, [])

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
                    <img src={productData.image} alt={productData.name} className="product-img" />
                </div>

                <div className="product-right">
                    <h1 className="product-title">{productData.name}</h1>
                    <p className="product-category">{productData.category}</p>
                    <p className="product-description">{productData.description}</p>
                    <p className="product-price">{productData.price} zł</p>
                    {productData.available ? (
                        <button className="buy-button">Dodaj do koszyka</button>
                    ) : (
                        <span className="product-unavailable">Produkt niedostępny</span>
                    )}
                </div>
            </div>
        </div>
    );

}
