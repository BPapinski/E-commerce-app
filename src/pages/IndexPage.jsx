import "./styles/style.css";
import "./styles/reset.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import Sidebar from "../Components/Sidebar";
import PaginationBar from "../Components/PaginationBar";
import React, { useEffect, useState, useCallback } from "react"; // Dodaj useCallback
import { useLocation, useNavigate } from "react-router-dom";
import AddNewProduct from "../Components/AddNewProduct";
import { useAuth } from "../contexts/AuthContext";
import useApi from "./utils/api";

export default function IndexPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const [totalPages, setTotalPages] = useState(10);

  const params = new URLSearchParams(location.search);
  const currentPage = parseInt(params.get("page")) || 1;

  const navigate = useNavigate();
  const { user, loadingUser, isLoggedIn } = useAuth(); 
  const { authFetch } = useApi();

  // Dynamiczne filtrowanie produktów na podstawie URL
  useEffect(() => {
    const fetchProducts = async () => { // Zmieniamy na funkcję async/await
      const params = new URLSearchParams(location.search);
      const category = params.get("category");
      const search = params.get("search");
      const minPrice = params.get("min_price");
      const maxPrice = params.get("max_price");
      const sellerId = params.get("sellerId");

      let apiUrl = "http://127.0.0.1:8000/api/store/";
      const queryParams = new URLSearchParams();

      if (category) queryParams.append("category", category);
      if (search) queryParams.append("search", search);
      if (minPrice) queryParams.append("min_price", minPrice);
      if (maxPrice) queryParams.append("max_price", maxPrice);
      if (sellerId) queryParams.append("sellerId", sellerId);

      queryParams.append("page", currentPage);

      if ([...queryParams].length > 0) {
        apiUrl += "?" + queryParams.toString();
      }

      try {
        // Użyj authFetch do pobierania produktów
        // Zakładam, że endpoint /api/store/ NIE wymaga tokena JWT, więc token nie jest wysyłany.
        // Jeśli jednak wymaga, authFetch i tak go doda automatycznie.
        const res = await authFetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Błąd podczas pobierania produktów");
        
        const data = await res.json();
        setProducts(data.results || data);
        const pages = Math.ceil(data.count / 10); // 10 = page_size z Django
        setTotalPages(pages);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać produktów."); // Ustaw ogólny błąd dla użytkownika

        // Jeśli aktualna strona > 1, spróbuj ponownie z pierwszą stroną
        if (currentPage > 1) {
          const params = new URLSearchParams(location.search);
          params.set("page", 1);
          navigate({ search: params.toString() });
        } else {
          // Jeśli to już pierwsza strona i jest błąd, nic więcej nie robimy
        }
      }
    };

    fetchProducts();
  }, [location.search, currentPage, navigate, authFetch]); // Dodano authFetch do zależności useEffect

  // Funkcje nawigacyjne (bez zmian, nie wymagają tokena)
  const nextPage = useCallback(() => {
    const page = currentPage + 1;
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
  }, [currentPage, location.search, navigate]);

  const prevPage = useCallback(() => {
    const page = Math.max(currentPage - 1, 1);
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
  }, [currentPage, location.search, navigate]);

  const goToPage = useCallback((pageNumber) => {
    const params = new URLSearchParams(location.search);
    params.set("page", pageNumber);
    navigate({ search: params.toString() });
  }, [location.search, navigate]);

  const setCategory = useCallback((category) => {
    const params = new URLSearchParams(location.search);
    if (category) {
      params.set("page", 1); // resetuj stronę na 1 przy zmianie kategorii
      params.set("category", category);
    } else {
      params.delete("category");
    }
    navigate({ search: params.toString() });
  }, [location.search, navigate]);

  const setAuthor = useCallback((sellerId) => {
    const params = new URLSearchParams(location.search);
    if (sellerId) {
      params.set("sellerId", sellerId);
    } else {
      params.delete("sellerId");
    }
    navigate({ search: params.toString() });
  }, [location.search, navigate]);


  // Funkcja dodawania do koszyka - TERAZ UŻYWA authFetch
  const handleAddToCart = useCallback(async (productId) => {
    try {
      // Używamy authFetch, który automatycznie obsłuży tokeny
      const response = await authFetch(
        "http://127.0.0.1:8000/api/store/cart/add/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Nagłówek Authorization NIE jest już tu potrzebny,
            // bo authFetch sam go dodaje i odświeża
          },
          body: JSON.stringify({
            product_id: productId, // Zmieniono z product_id na product zgodnie z API
            quantity: 1,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Produkt dodany do koszyka:", data);
        alert("Produkt został dodany do koszyka!");
        // Tutaj możesz dodać logikę aktualizacji stanu koszyka w UI
      } else {
        const errorData = await response.json();
        console.error("Błąd podczas dodawania do koszyka:", errorData);
        // Sprawdź, czy błąd to "token_not_valid"
        if (errorData.code === 'token_not_valid') {
            alert('Twoja sesja wygasła. Zaloguj się ponownie.');
            // authFetch powinien sam wylogować, ale można tu dodać dodatkowe przekierowanie
        } else {
            alert(`Nie udało się dodać produktu do koszyka: ${JSON.stringify(errorData.detail || errorData)}`);
        }
      }
    } catch (error) {
      console.error("Wystąpił błąd sieci lub inny błąd:", error);
      alert("Wystąpił błąd podczas komunikacji z serwerem.");
    }
  }, [authFetch]); // Zależność tylko od authFetch

  return (
    <div className="container">
      <Header />
      <Subheader />
      <div className="main">
        <Sidebar />
        <div className="content">
          {loadingUser ? (
            <h3>Ładowanie danych użytkownika...</h3> // Poprawiony tekst ładowania
          ) : user?.is_admin ? (
            <AddNewProduct />
          ) : isLoggedIn ? (
            <h3>Brak uprawnień. Zaloguj się jako administrator.</h3> // Poprawiony tekst
          ) : (
            <h3>Proszę się zalogować, aby zobaczyć więcej opcji.</h3> // Poprawiony tekst
          )}

          {error && <div className="error">{error}</div>}

          {products.map((product, index) => (
            <div key={index} className="product">
              <div className="product-image">
                <img src={`${product.image}`} alt={product.name} />
              </div>
              <div className="product-data">
                <div className="product-info">
                  <h2 className="product-name" style={{ fontSize: "1.8rem" }}>
                    <a href={`/product/${product.id}`}>{product.name}</a>
                  </h2>
                  <h2
                    className="category"
                    style={{ fontSize: "1rem" }}
                    onClick={() => setCategory(product.category_name)}
                  >
                    {product.category_name}
                  </h2>
                  <h2
                    style={{
                      color: "white",
                      fontSize: "1rem",
                      paddingTop: "1em",
                    }}
                  >
                    {product.condition}
                  </h2>
                  <h2
                    className="product-author"
                    style={{}}
                    onClick={() => setAuthor(product.seller)}
                  >
                    sprzedawca: {product.seller_email}
                  </h2>
                </div>
                <div className="product-placeholder"></div>
                <div className="product-price">
                  <h2 style={{ color: "white", fontSize: "1.2rem" }}>
                    {product.price}zł
                  </h2>
                  <button
                    style={{ marginTop: "0.5em" }}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    Dodaj do koszyka 
                  </button>
                </div>
              </div>
            </div>
          ))}

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            nextPage={nextPage}
            prevPage={prevPage}
            goToPage={goToPage}
          />
        </div>
      </div>
    </div>
  );
}