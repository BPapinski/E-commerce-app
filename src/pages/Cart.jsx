import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./styles/style.css";
import "./styles/reset.css";
import styles from "./styles/Cart.module.css";
import { useNavigate } from "react-router-dom";


export default function Cart() {
    const navigate = useNavigate()
    const [items, setItems] = useState([]);
    const { token, isLoggedIn, loadingUser } = useAuth();

    useEffect(() => {
        if (!isLoggedIn && !loadingUser) {
        navigate("/login");
        }
    }, [isLoggedIn, loadingUser, navigate]);


   // ❗ Pobieranie koszyka
    useEffect(() => {
        if (!token || !isLoggedIn) return;

        fetch("http://127.0.0.1:8000/api/store/cart/", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        })
        .then((res) => {
            if (res.status === 401) {
            navigate("/login");
            return Promise.reject("Unauthorized");
            }
            return res.json();
        })
        .then((data) => {
            setItems(data.items || []);
        })
        .catch((error) => {
            console.error("Błąd podczas pobierania koszyka:", error);
        });
    }, [token, isLoggedIn, navigate]);

    const totalPrice = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity
        ,0
    );


  // Zwiększanie ilości
  const increaseQuantity = (item) => {
    fetch(`http://127.0.0.1:8000/api/store/cart/update/${item.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: item.quantity + 1 }),
    })
      .then((res) => res.json())
      .then((updatedItem) => {
        setItems((prev) =>
          prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
        );
      })
      .catch((err) => console.error("Błąd przy zwiększaniu ilości:", err));
  };

  // Zmniejszanie ilości lub usuwanie, jeśli = 1
  const decreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      // Usuń z koszyka
      fetch(`http://127.0.0.1:8000/api/store/cart/remove/${item.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(() => {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        })
        .catch((err) => console.error("Błąd przy usuwaniu z koszyka:", err));
    } else {
      // Zmniejsz ilość
      fetch(`http://127.0.0.1:8000/api/store/cart/update/${item.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: item.quantity - 1 }),
      })
        .then((res) => res.json())
        .then((updatedItem) => {
          setItems((prev) =>
            prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
          );
        })
        .catch((err) => console.error("Błąd przy zmniejszaniu ilości:", err));
    }
  };

  return (
    <div className={styles.cartContainer}>
        <h2 className={styles.cartTitle}>Twój koszyk</h2>
        <div className={styles.cartList}>
            {items.map((item) => (
            <div className={styles.cartItem} key={item.id}>
                <img
                src={`http://127.0.0.1:8000${item.product.image}`}
                alt={item.product.name}
                className={styles.productImage}
                />
                <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.product.name}</h3>
                <p className={styles.itemDescription}>{item.product.description}</p>
                <p className={styles.itemSeller}>Sprzedawca: {item.product.seller}</p>
                </div>
                <div className={styles.itemMeta}>
                <span className={styles.itemPrice}>{item.product.price} zł</span>
                <div className={styles.quantityControls}>
                    <button onClick={() => decreaseQuantity(item)}>–</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item)}>+</button>
                </div>
                </div>
            </div>
            ))}
        </div>
        <div className={styles.cartFooter}>
  <div className={styles.totalPrice}>
    Łącznie: <strong>{totalPrice.toFixed(2)} zł</strong>
  </div>
  <div className={styles.cartButtons}>
    <button
      className={styles.backButton}
      onClick={() => navigate("/")}
    >
      ← Wróć do sklepu
    </button>
    <button
      className={styles.checkoutButton}
      onClick={() => navigate("/checkout")}
    >
      Przejdź do płatności
    </button>
  </div>
</div>

    </div>

  );
}
