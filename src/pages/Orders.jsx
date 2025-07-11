

import React, { useState, useEffect } from "react";
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
  const { accessToken, isLoggedIn, loadingUser } = useAuth();

  useEffect(() => {
    if (!accessToken || !isLoggedIn) return;
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/store/orders/me/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setOrders([]);
      });
  }, [accessToken, isLoggedIn]);

  // Funkcja do rozwijania/zamykania szczegółów zamówienia
  const handleExpandClick = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Funkcja do otwierania modalu potwierdzenia dla przełączania statusu
  const handleToggleClick = (orderId, orderName) => {
    setOrderIdToToggle(orderId);
    setOrderNameToToggle(orderName);
    setIsModalOpen(true);
  };

  // Funkcja wywoływana po potwierdzeniu w modal
  const confirmToggle = () => {
    // Znajdź zamówienie i zmień jego status (available)
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

  // Funkcja wywoływana po anulowaniu w modal
  const cancelToggle = () => {
    setIsModalOpen(false);
    setOrderIdToToggle(null);
    setOrderNameToToggle("");
  };

  return (
    <>
      <Header />

      <div className={styles['user-orders-container']}>
        <h1 className={styles['user-orders-title']}>Twoje zamówienia</h1>

        {loading ? (
          <div className={styles.loading}>Ładowanie zamówień...</div>
        ) : (
          <div className={styles['orders-list']}>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className={`${styles['order-card']} ${!order.available ? styles.cancelled : ''}`}
                >
                  <div className={styles['order-info']}>
                    <h2 className={styles['order-name']}>{order.name}</h2>
                    <p className={styles['order-description']}>{order.description}</p>
                    <p className={styles['order-price']}>Kwota: {order.price} zł</p>
                    <div className={styles.buttons}>
                      <button
                        className={`${styles.btn}`}
                        onClick={() => handleExpandClick(order.id)}
                      >
                        {expandedOrderId === order.id ? 'Ukryj produkty' : 'Pokaż produkty'}
                      </button>
                      {order.paid ? (
                        <>
                          <button
                            className={`${styles.btn} ${styles.cancel}`}
                            onClick={() => handleToggleClick(order.id, order.name)}
                          >
                            Anuluj
                          </button>
                        </>
                      ) : order.available ? (
                        <>
                          <button
                            className={`${styles.btn} ${styles.cancel}`}
                            onClick={() => handleToggleClick(order.id, order.name)}
                          >
                            Anuluj
                          </button>
                          <button
                            className={`${styles.btn} ${styles.pay}`}
                            onClick={() => alert('Opłać zamówienie: ' + order.id)}
                          >
                            Opłać
                          </button>
                        </>
                      ) : (
                        <button
                          className={`${styles.btn} ${styles.restore}`}
                          onClick={() => handleToggleClick(order.id, order.name)}
                        >
                          Aktywuj
                        </button>
                      )}
                    </div>
                    {expandedOrderId === order.id && (
                      <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                        <strong>Produkty w zamówieniu:</strong>
                        <ul style={{ margin: '0.5rem 0 0 0', padding: 0, listStyle: 'none' }}>
                          {order.products.map(prod => (
                            <li key={prod.id} style={{ padding: '0.2rem 0' }}>
                              {prod.name} <span style={{ color: '#888' }}>({prod.price} zł)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
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
    </>
  );
}