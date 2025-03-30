import "./styles/style.css";
import "./styles/reset.css";
import shoppingCartIcon from "../icons/shopping_cart.svg";
import messageIcon from "../icons/message.svg";
import bellIcon from "../icons/bell.svg";
import heartIcon from "../icons/heart.svg";
import logoutIcon from "../icons/logout.svg";

import logo from "../icons/logo.png"


export default function IndexPage() {
  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="header-element">
          <img src={logo} alt="Logo" />
        </div>
        <div className="header-element" style={{ flex: 2 }}>
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <button className="search-button">Search</button>
          </div>
        </div>
        <div className="header-element icons" style={{ flex: 2 }}>
          {[shoppingCartIcon, messageIcon, bellIcon, heartIcon, logoutIcon].map((icon, index) => (
            <img key={index} src={icon} alt="icon" className="filter-pink" style={icon === heartIcon || icon === logoutIcon ? { height: "48px" } : {}} />
          ))}
        </div>
        <div className="header-element">
          <h1>Profile</h1>
        </div>
      </div>
      
      {/* Subheader */}
      <div className="subheader">
        {["Wyprzedaże i Promocje", "Ekskluzywne Oferty", "Darmowa Dostawa", "Gwarancja Najniższej Ceny", "Bezpieczne Transakcje", "Polityka Prywatności", "Ochrona Kupujących"].map((text, index) => (
          <div key={index} className="subheader-element">
            <h2>{text}</h2>
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="main">
        <div className="sidebar"></div>
        <div className="content">
          {[
            { name: "Nazwa produktu", category: "Kategoria", price: "100.00zł", img: "graphics/image-placeholder.jpg", condition: "Używane" },
            { name: "iPhone 13", category: "Smartfony", price: "2 499.00zł", img: "https://idream.pl/images/detailed/96/iPhone_16_Teal_PDP_Image_Position_1__pl-PL_a1wg-i5.jpg", condition: "Używane" },
            { name: "Dell XPS 15", category: "Laptopy", price: "6 999.00zł", img: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7", condition: "Nowy" },
            { name: "Sony WH-1000XM4", category: "Słuchawki", price: "1 199.00zł", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjngqC_NKcjgBJGneYnNKbsGUtT2908K3MDA&s", condition: "Nowe" },
            { name: "PlayStation 5", category: "Konsole", price: "2 999.00zł", img: "https://prod-api.mediaexpert.pl/api/images/gallery_500_500/thumbnails/images/60/6007768/Konsola-SONY-PlayStation-5-Digital-Slim-skos.jpg", condition: "Nowe" },
          ].map((product, index) => (
            <div key={index} className="product">
              <div className="product-image">
                <img src={product.img} alt={product.name} />
              </div>
              <div className="product-data">
                <div className="product-info">
                  <h2 className="product-name" style={{ fontSize: "1.8rem" }}>
                    <a href="#">{product.name}</a>
                  </h2>
                  <h2 className="category" style={{ fontSize: "1rem" }}>{product.category}</h2>
                  <h2 style={{ color: "white", fontSize: "1rem", paddingTop: "1em" }}>{product.condition}</h2>
                </div>
                <div className="product-placeholder"></div>
                <div className="product-price">
                  <h2 style={{ color: "white", fontSize: "1.2rem" }}>{product.price}</h2>
                  <button style={{ marginTop: "0.5em" }}>Kup</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}