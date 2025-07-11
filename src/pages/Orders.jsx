import React, { useState, useEffect } from "react"; // Dodajemy useEffect
import Header from "../Components/Header";
import ConfirmModal from "../Components/IndexPage/ConfirmModal";

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]); // Zmieniamy 'products' na 'orders'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderIdToToggle, setOrderIdToToggle] = useState(null); // Zmieniamy 'productIdToToggle'
  const [orderNameToToggle, setOrderNameToToggle] = useState(""); // Zmieniamy 'productNameToToggle'

  // Placeholderowe dane dla zamówień
  const placeholderOrders = [
    {
      id: 1,
      name: "Zamówienie #12345",
      description: "Produkt A, Produkt B",
      price: 150.00,
      image: "/media/product_images/placeholder1.jpg", // Placeholderowa ścieżka do obrazu
      available: true, // Reprezentuje status zamówienia (np. aktywne/anulowane)
    },
    {
      id: 2,
      name: "Zamówienie #67890",
      description: "Produkt C",
      price: 75.50,
      image: "/media/product_images/placeholder2.jpg",
      available: false, // Oznacza, że zamówienie jest 'usunięte' / anulowane
    },
    {
      id: 3,
      name: "Zamówienie #11223",
      description: "Produkt D, Produkt E, Produkt F",
      price: 300.00,
      image: "/media/product_images/placeholder3.jpg",
      available: true,
    },
  ];

  // Symulacja ładowania danych
  useEffect(() => {
    // W prawdziwej aplikacji tutaj wykonasz zapytanie do API
    // np. fetch('http://127.0.0.1:8000/api/orders/')
    // .then(response => response.json())
    // .then(data => {
    //    setOrders(data);
    //    setLoading(false);
    // })
    // .catch(error => {
    //    console.error("Błąd ładowania zamówień:", error);
    //    setLoading(false);
    // });

    const timer = setTimeout(() => {
      setOrders(placeholderOrders);
      setLoading(false);
    }, 1000); // Symulujemy 1 sekundę ładowania

    return () => clearTimeout(timer);
  }, []);

  // Funkcja do obsługi kliknięcia "Edytuj"
  const handleEditClick = (orderId) => {
    console.log(`Edytuj zamówienie o ID: ${orderId}`);
    // Tutaj możesz przekierować użytkownika do strony edycji zamówienia
    // np. history.push(`/orders/edit/${orderId}`);
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
      <div className="container user-orders-container"> {/* Zmieniona klasa */}
        <h1 className="user-orders-title">Twoje zamówienia</h1> {/* Zmieniony tytuł */}

        {loading ? (
          <div className="loading">Ładowanie zamówień...</div>
        ) : (
          <div className="orders-list"> {/* Zmieniona klasa */}
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${!order.available ? "cancelled" : ""}`} // Zmieniona klasa
                >
                  <img
                    src={`http://127.0.0.1:8000${order.image}`}
                    alt={order.name}
                    className="order-image"
                  />
                  <div className="order-info">
                    <h2 className="order-name">{order.name}</h2>
                    <p className="order-description">{order.description}</p>
                    <p className="order-price">Kwota: {order.price} zł</p> {/* Zmieniony tekst */}
                    <div className="buttons">
                      {order.available ? (
                        <>
                          <button
                            className="btn edit"
                            onClick={() => handleEditClick(order.id)}
                          >
                            Edytuj
                          </button>
                          <button
                            className="btn cancel" // Zmieniona klasa
                            onClick={() =>
                              handleToggleClick(order.id, order.name)
                            }
                          >
                            Anuluj
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn restore"
                          onClick={() =>
                            handleToggleClick(order.id, order.name)
                          }
                        >
                          Aktywuj
                        </button>
                      )}
                    </div>
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