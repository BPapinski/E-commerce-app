import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import shoppingCartIcon from "../icons/shopping_cart.svg";
import messageIcon from "../icons/message.svg";
import bellIcon from "../icons/bell.svg";
import heartIcon from "../icons/heart.svg";
import logoutIcon from "../icons/logout.svg";
import loginIcon from "../icons/login.svg";
import logoIcon from "../icons/logo.png";
import personIcon from "../icons/person.svg";
import "./styles/HeaderDropdown.css";
import useApi from "../pages/utils/api";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { token, isLoggedIn, loadingUser, logout } = useAuth();
  const { authFetch } = useApi();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoggedIn) return;

      try {
        const res = await authFetch(
          "http://127.0.0.1:8000/api/store/notifications/"
        );
        if (!res.ok) throw new Error("Błąd odpowiedzi serwera");

        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      } catch (err) {
        console.error("Błąd ładowania powiadomień:", err);
      }
    };

    fetchNotifications();
  }, [isLoggedIn]);

  function submitSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    navigate({ search: params.toString() });
  }

  return (
    <div className="header">
      <div className="header-element">
        <a href="/">
          <img src={logoIcon} alt="Logo" />
        </a>
      </div>
      <div className="header-element" style={{ flex: 2 }}>
        <div className="search-bar">
          <form action="" onSubmit={submitSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="search-button">Search</button>
          </form>
        </div>
      </div>
      <div className="header-element icons" style={{ flex: 2 }}>
        <a href="/cart">
          <img src={shoppingCartIcon} alt="Cart" className="filter-pink" />
        </a>
        <a href="/messages">
          <img src={messageIcon} alt="Messages" className="filter-pink" />
        </a>

        <div className="notification-dropdown-container">
          <a href="/notifications" className="notification-dropdown-toggle">
            <img
              src={bellIcon}
              alt="Notifications"
              className="filter-pink"
              style={{ height: "48px" }}
            />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </a>
          <div className="notification-dropdown-menu">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.is_read ? "" : "unread"}`}
              >
                <a href="#">{n.message}</a>
              </div>
            ))}
          </div>
        </div>

        <a href="/favourites">
          <img
            src={heartIcon}
            alt="Ulubione"
            className="filter-pink"
            style={{ height: "48px" }}
          />
        </a>
        {isLoggedIn ? (
          <div className="dropdown-container">
            <a href="/profile" className="dropdown-toggle">
              <img
                src={personIcon}
                alt=""
                className="filter-pink"
                style={{ height: "48px" }}
              />
            </a>
            <div className="dropdown-menu">
              <a href="/myproducts">Sprzedaje</a>
              <a href="/settings">Ustawienia</a>
              <a href="/orders">Moje Zamówienia</a>
              <a href="/help">Pomoc</a>
              <button onClick={logout} className="logout-button">
                Wyloguj
              </button>
            </div>
          </div>
        ) : (
          <a href="/login">
            <img
              src={loginIcon}
              alt="Login"
              className="filter-pink"
              style={{ height: "48px" }}
            />
          </a>
        )}
      </div>
    </div>
  );
}
