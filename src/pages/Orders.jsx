
import React, { useState, useEffect } from "react";
import CartIcon from "../icons/cart.svg";
import PersonIcon from "../icons/person.svg";
import BellIcon from "../icons/bell.svg";
import EditIcon from "../icons/edit.svg";
import DeleteIcon from "../icons/delete.svg";
import styles from "./styles/Orders.module.css";
import Header from "../Components/Header";
import ConfirmModal from "../Components/IndexPage/ConfirmModal";
import { useAuth } from "../contexts/AuthContext";

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderIdToToggle, setOrderIdToToggle] = useState(null);
  const [orderNameToToggle, setOrderNameToToggle] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  // Zawsze pobieraj token z localStorage na starcie
  const { accessToken: contextToken, isLoggedIn, loadingUser } = useAuth();
  const [accessToken, setAccessToken] = useState(() => contextToken || localStorage.getItem('token'));
  useEffect(() => {
    // Synchronizuj token z contextu jeśli się zmieni
    if (contextToken && contextToken !== accessToken) {
      setAccessToken(contextToken);
      localStorage.setItem('token', contextToken);
    }
  }, [contextToken]);
  const [refreshing, setRefreshing] = useState(false);

  const markOrderPaid = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Musisz się zalogować ponownie! Brak tokena w localStorage.");
        return;
      }
      const res = await fetch("http://127.0.0.1:8000/api/store/orders/mark_paid/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.status === 401) {
        alert("Musisz się zalogować ponownie! Token wygasł lub nie został przesłany.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        fetchOrders(); // odśwież zamówienia
      } else {
        alert("Błąd oznaczania zamówienia jako opłacone: " + (data.error || ""));
      }
    } catch (err) {
      alert("Błąd połączenia z backendem: " + err.message);
    }
  };

  // Wywołaj po powrocie z płatności Stripe
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "true") {
    const paidOrderId = localStorage.getItem("paidOrderId");
    if (paidOrderId) {
      markOrderPaid(Number(paidOrderId));
      localStorage.removeItem("paidOrderId");
    }
  }
}, []);


  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    if (!token || !isLoggedIn) return;
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/store/orders/me/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Musisz się zalogować ponownie! Token wygasł lub nie został przesłany.");
          setLoading(false);
          setRefreshing(false);
          setOrders([]);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOrders(data.orders || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        setLoading(false);
        setOrders([]);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [isLoggedIn]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleExpandClick = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Funkcja do otwierania modalu potwierdzenia dla przełączania statusu
  const handleToggleClick = (orderId, orderName) => {
    setOrderIdToToggle(orderId);
    setOrderNameToToggle(orderName);
    setIsModalOpen(true);
  };


  const confirmToggle = () => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderIdToToggle
          ? { ...order, available: !order.available }
          : order
      )
    );
    console.log(`Zmieniono status zamówienia o ID: ${orderIdToToggle}`);
    // W prawdziwej aplikacji wysłałbyś zapytanie do API
    // np. fetch(`http://127.0.0.1:8000/api/orders/${orderIdToToggle}/toggle_status/`, { method: 'POST' });
    setIsModalOpen(false);
    setOrderIdToToggle(null);
    setOrderNameToToggle("");
  };


  const cancelToggle = () => {
    setIsModalOpen(false);
    setOrderIdToToggle(null);
    setOrderNameToToggle("");
  };

  // Ładowanie skryptu PayPal globalnie dla Orders
  useEffect(() => {
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=AXKJK9Y_IkmhntfSDwR0Fe8VUUWGjrOqZj-cvvxkNGyMQTC2EHfE92q2uJTZW8rOJe-u8fijMHQcwqE2&currency=PLN";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Panel płatności
  const [payPanelOrderId, setPayPanelOrderId] = useState(null);
  const [showPaypalBtnOrderId, setShowPaypalBtnOrderId] = useState(null);

  const handlePayPanel = (orderId) => {
    setPayPanelOrderId(orderId);
    setShowPaypalBtnOrderId(null);
  };
  const handleClosePayPanel = () => {
    setPayPanelOrderId(null);
    setShowPaypalBtnOrderId(null);
  };

  const handleShowPaypalBtn = (orderId) => {
    setShowPaypalBtnOrderId(orderId);
    setTimeout(() => {
      const containerId = `paypal-order-${orderId}`;
      const prev = document.getElementById(containerId);
      if (prev) prev.innerHTML = "";
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            layout: 'horizontal',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 38,
          },
          createOrder: function (data, actions) {
            const order = orders.find(o => o.id === orderId);
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: order.price.toString(),
                    currency_code: 'PLN',
                  },
                  description: order.name,
                },
              ],
            });
          },
          onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
              alert('Symulacja płatności PayPal: ' + details.payer.name.given_name);
              // Oznacz zamówienie jako opłacone po PayPal
              markOrderPaid(orderId);
            });
          },
          onError: function (err) {
            alert('Błąd PayPal: ' + err.message + '\nSpróbuj w innej przeglądarce, trybie incognito lub na HTTPS. Upewnij się, że używasz sandbox client-id.');
          }
        }).render(`#${containerId}`);
      }
    }, 100);
  };

  // Stripe Checkout dla Przelew/BLIK
  const handleStripePayment = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Musisz się zalogować ponownie! Brak tokena w localStorage.");
        return;
      }
      const res = await fetch("http://127.0.0.1:8000/api/store/orders/stripe_checkout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.status === 401) {
        alert("Musisz się zalogować ponownie! Token wygasł lub nie został przesłany.");
        return;
      }
      const data = await res.json();
      if (data.checkout_url) {
        localStorage.setItem("paidOrderId", orderId);
        window.location.href = data.checkout_url;
      } else {
        alert("Błąd Stripe: " + (data.error || "Nie udało się utworzyć sesji płatności."));
      }
    } catch (err) {
      alert("Błąd Stripe: " + err.message);
    }
  };
  // ...existing code...
  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <Header />
      <div className={styles['user-orders-container']} style={{ marginTop: 0 }}>
        <div className={styles['orders-header']}>
          <h1 className={styles['user-orders-title']}>
            <img src={CartIcon} alt="Zamówienia" className={styles['orders-title-icon']} />
            Twoje zamówienia
          </h1>
          <button className={styles['refresh-btn']} onClick={handleRefresh} disabled={refreshing || loading} title="Odśwież zamówienia">
            <img src={BellIcon} alt="Odśwież" style={{ width: 22, height: 22, marginRight: 6 }} />
            {refreshing ? "Odświeżanie..." : "Odśwież"}
          </button>
        </div>
        <div className={styles['paypal-warning']}>
          Uwaga: W środowisku testowym (localhost) okno PayPal może się automatycznie zamykać lub nie działać w pełni poprawnie. Zalecamy testowanie w trybie incognito, na HTTPS lub w innej przeglądarce. Wersja produkcyjna na prawdziwej domenie działa bez problemu.
        </div>
        {loading ? (
          <div className={styles.loading}>Ładowanie zamówień...</div>
        ) : (
          <div className={styles['orders-list']}>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                let status = "Oczekuje na płatność";
                let badgeClass = styles.statusPending;
                if (!order.available) {
                  status = "Anulowane";
                  badgeClass = styles.statusCancelled;
                } else if (order.paid) {
                  status = "Opłacone";
                  badgeClass = styles.statusPaid;
                }
                return (
                  <div
                    key={order.id}
                    className={`${styles['order-card']} ${!order.available ? styles.cancelled : ''}`}
                  >
                    <div className={styles['order-info']}>
                      <div className={styles['order-top']}>
                        <span className={styles['order-badge']}>
                          <span className={badgeClass}>{status}</span>
                        </span>
                        <h2 className={styles['order-name']}>
                          <img src={PersonIcon} alt="Użytkownik" className={styles['order-user-icon']} />
                          {order.name}
                        </h2>
                        <p className={styles['order-description']}>{order.description}</p>
                        <p className={styles['order-price']}>Kwota: {order.price} zł</p>
                      </div>
                      <div className={styles.buttons}>
                        <button
                          className={`${styles.btn}`}
                          onClick={() => handleExpandClick(order.id)}
                        >
                          <img src={CartIcon} alt="Produkty" style={{ width: 18, height: 18, marginRight: 4, verticalAlign: "middle" }} />
                          {expandedOrderId === order.id ? 'Ukryj produkty' : 'Pokaż produkty'}
                        </button>
                        {order.paid ? (
                          <button
                            className={`${styles.btn} ${styles.cancel}`}
                            onClick={() => handleToggleClick(order.id, order.name)}
                            title="Anuluj zamówienie"
                          >
                            <img src={DeleteIcon} alt="Anuluj" style={{ width: 16, height: 16, marginRight: 4, verticalAlign: "middle" }} />
                            Anuluj
                          </button>
                        ) : order.available ? (
                          <>
                            <button
                              className={`${styles.btn} ${styles.cancel}`}
                              onClick={() => handleToggleClick(order.id, order.name)}
                              title="Anuluj zamówienie"
                            >
                              <img src={DeleteIcon} alt="Anuluj" style={{ width: 16, height: 16, marginRight: 4, verticalAlign: "middle" }} />
                              Anuluj
                            </button>
                            <button
                              className={`${styles.btn} ${styles.pay}`}
                              onClick={() => handlePayPanel(order.id)}
                              title="Opłać zamówienie"
                            >
                              <img src={EditIcon} alt="Opłać" style={{ width: 16, height: 16, marginRight: 4, verticalAlign: "middle" }} />
                              Opłać
                            </button>
                          </>
                        ) : (
                          <button
                            className={`${styles.btn} ${styles.restore}`}
                            onClick={() => handleToggleClick(order.id, order.name)}
                            title="Aktywuj zamówienie"
                          >
                            <img src={EditIcon} alt="Aktywuj" style={{ width: 16, height: 16, marginRight: 4, verticalAlign: "middle" }} />
                            Aktywuj
                          </button>
                        )}
                      </div>
                      {/* Panel płatności */}
                      {payPanelOrderId === order.id && order.available && !order.paid && (
                        <div className={styles['pay-panel']}>
                          <div className={styles['pay-panel-row']}>
                            <button className={styles['pay-option-btn']} onClick={() => handleShowPaypalBtn(order.id)}>
                              <img src={EditIcon} alt="PayPal" style={{ width: 18, height: 18, marginRight: 6, verticalAlign: "middle" }} />
                              PayPal
                            </button>
                            <button className={styles['pay-option-btn']} onClick={() => handleStripePayment(order.id)}>
                              Przelew
                            </button>
                            <button className={styles['pay-option-btn']} onClick={() => handleStripePayment(order.id)}>
                              BLIK
                            </button>
                            <button className={styles['pay-option-btn']} onClick={handleClosePayPanel}>
                              Anuluj
                            </button>
                          </div>
                          {showPaypalBtnOrderId === order.id && (
                            <div id={`paypal-order-${order.id}`} className={styles['paypal-btn-container']}></div>
                          )}
                        </div>
                      )}
                    {/* Produkty w zamówieniu */}
                    {expandedOrderId === order.id && (
                      <div className={styles['order-products-list']}>
                        <strong>Produkty w zamówieniu:</strong>
                        <ul>
                          {order.products.map(prod => (
                            <li key={prod.id} className={styles['order-product-item']}>
                              <img src={CartIcon} alt="Produkt" className={styles['product-icon']} />
                              <span className={styles['product-name']}>{prod.name}</span>
                              <span className={styles['product-price']}>{prod.price} zł</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                );
              })
            ) : (
              <div>Brak zamówień do wyświetlenia.</div>
            )}
          </div>
        )}
        <ConfirmModal
          isOpen={isModalOpen}
          message={`Czy na pewno chcesz ${
            orders.find((o) => o.id === orderIdToToggle)?.available
              ? "anulować"
              : "aktywować"
          } zamówienie "${orderNameToToggle}"?`}
          onConfirm={confirmToggle}
          onCancel={cancelToggle}
        />
      </div>
    </div>
  );
}
