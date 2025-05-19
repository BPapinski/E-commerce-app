import { useEffect, useState } from "react";
import shoppingCartIcon from "../icons/shopping_cart.svg";
import messageIcon from "../icons/message.svg";
import bellIcon from "../icons/bell.svg";
import heartIcon from "../icons/heart.svg";
import logoutIcon from "../icons/logout.svg";
import loginIcon from "../icons/login.svg";
import logoIcon from "../icons/logo.png"

export default function Header({user}) {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem("loggedIn") === "true";
    setIsLoggedIn(logged);
  }, []);

  return (
    <div className="header">
        
      <div className="header-element">
        <a href="/">
            <img src={logoIcon} alt="Logo" />
        </a>
      </div>
      <div className="header-element" style={{ flex: 2 }}>
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <button className="search-button">Search</button>
        </div>
      </div>
      <div className="header-element icons" style={{ flex: 2 }}>
        <a href="/cart">
            <img src={shoppingCartIcon} alt="Cart" className="filter-pink" />
        </a>
        <a href="/messages">
            <img src={messageIcon} alt="Messages" className="filter-pink" />
        </a>
        <a href="/notifications">
            <img src={bellIcon} alt="Notifications" className="filter-pink" />
        </a>
        <a href="/favorites">
            <img src={heartIcon} alt="Favourites" className="filter-pink" style={{ height: "48px" }} />
        </a>
        {/* 🔐 Zależność od logowania */}
        {isLoggedIn ? (
          <a href="/logout">
            <img src={logoutIcon} alt="Logout" className="filter-pink" style={{ height: "48px" }} />
          </a>
        ) : (
          <a href="/login">
            <img src={loginIcon} alt="Login" className="filter-pink" style={{ height: "48px" }} />
          </a>
        )}
        </div>
      <div className="header-element">
        <h1>{user ? <h1>{user.email}</h1> : <h1>Gość</h1>}</h1>
      </div>
    </div>
  );
}