import "./styles/style.css";
import "./styles/reset.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import Sidebar from "../Components/Sidebar";
import PaginationBar from "../Components/IndexPage/PaginationBar";
import React, { useEffect, useState, useCallback } from "react"; // Dodaj useCallback
import { useLocation, useNavigate } from "react-router-dom";
import AddNewProduct from "../Components/IndexPage/AddNewProduct";
import { useAuth } from "../contexts/AuthContext";
import useApi from "./utils/api";
import ProductCard from "../Components/IndexPage/ProductCard";

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
    const fetchProducts = async () => {
      const params = new URLSearchParams(location.search);
      const category = params.get("category");
      const search = params.get("search");
      const minPrice = params.get("min_price");
      const maxPrice = params.get("max_price");
      const sellerId = params.get("sellerId");
      const condition = params.get("condition");

      let apiUrl = "http://127.0.0.1:8000/api/store/";
      const queryParams = new URLSearchParams();

      if (category) queryParams.append("category", category);
      if (search) queryParams.append("search", search);
      if (minPrice) queryParams.append("min_price", minPrice);
      if (maxPrice) queryParams.append("max_price", maxPrice);
      if (sellerId) queryParams.append("sellerId", sellerId);
      if (condition) queryParams.append("condition", condition);

      queryParams.append("page", currentPage);

      if ([...queryParams].length > 0) {
        apiUrl += "?" + queryParams.toString();
      }

      try {
        const res = await authFetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Błąd podczas pobierania produktów");

        const data = await res.json();
        setProducts(data.results || data);
        const pages = Math.ceil(data.count / 10);
        setTotalPages(pages);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać produktów.");

        if (currentPage > 1) {
          const params = new URLSearchParams(location.search);
          if (params.get("page") !== "1") {
            params.set("page", 1);
            navigate({ search: params.toString() });
          }
        }
      }
    };

    // Prevent infinite loop by debouncing effect
    let timeout = setTimeout(fetchProducts, 100);

    return () => clearTimeout(timeout);
  }, [location.search, currentPage]);

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

  const goToPage = useCallback(
    (pageNumber) => {
      const params = new URLSearchParams(location.search);
      params.set("page", pageNumber);
      navigate({ search: params.toString() });
    },
    [location.search, navigate]
  );


  // Funkcja dodawania do koszyka - TERAZ UŻYWA authFetch
  const handleAddToCart = useCallback(
    async (productId) => {
      try {
        // Używamy authFetch, który automatycznie obsłuży tokeny
        const response = await authFetch(
          "http://127.0.0.1:8000/api/store/cart/add/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product_id: productId,
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
          if (errorData.code === "token_not_valid") {
            alert("Twoja sesja wygasła. Zaloguj się ponownie.");
            // authFetch powinien sam wylogować, ale można tu dodać dodatkowe przekierowanie
          } else {
            alert(
              `Nie udało się dodać produktu do koszyka: ${JSON.stringify(
                errorData.detail || errorData
              )}`
            );
          }
        }
      } catch (error) {
        console.error("Wystąpił błąd sieci lub inny błąd:", error);
        alert("Wystąpił błąd podczas komunikacji z serwerem.");
      }
    },
    [authFetch]
  ); // Zależność tylko od authFetch

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
            <ProductCard
              key={index}
              product={product}
              handleAddToCart={handleAddToCart}
              user = {user}
            />
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
