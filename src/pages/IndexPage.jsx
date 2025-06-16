import "./styles/style.css";
import "./styles/reset.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import Sidebar from "../Components/Sidebar";
import PaginationBar from "../Components/PaginationBar";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddNewProduct from "../Components/AddNewProduct";
import { useAuth } from "../contexts/AuthContext";

export default function IndexPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);




  const [totalPages, setTotalPages] = useState(10);

  const params = new URLSearchParams(location.search);
  const currentPage = parseInt(params.get("page")) || 1;

  
  const navigate = useNavigate();
  const { token, isLoggedIn, login, logout, user, loadingUser } = useAuth();
  console.log(login)

  

  // Dynamiczne filtrowanie produktów na podstawie URL
  useEffect(() => {
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
    fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Błąd podczas pobierania produktów");
        return res.json();
      })
      .then((data) => {
        setProducts(data.results || data);
        const pages = Math.ceil(data.count / 10); // 10 = page_size z Django
        setTotalPages(pages);
        setError(null);
      })
      .catch((err) => {
        console.error(err);

        // Jeśli aktualna strona > 1, spróbuj ponownie z pierwszą stroną
        if (currentPage > 1) {
          const params = new URLSearchParams(location.search);
          params.set("page", 1);
          navigate({ search: params.toString() });
        } else {
          setError("Nie udało się pobrać produktów.");
        }
      });
  }, [location.search, currentPage]); // <- reaguje na zmiany w URL/numerze stronie

  function nextPage() {
    const page = currentPage + 1;
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
  }

  function prevPage() {
    const page = Math.max(currentPage - 1, 1);
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
  }

  function goToPage(pageNumber) {
    const params = new URLSearchParams(location.search);
    params.set("page", pageNumber);
    navigate({ search: params.toString() });
  }

  function setCategory(category) {
    const params = new URLSearchParams(location.search);
    if (category) {
      params.set("page", 1); // resetuj stronę na 1 przy zmianie kategorii
      params.set("category", category);
    } else {
      params.delete("category");
    }
    navigate({ search: params.toString() });
  }

  function setAuthor(sellerId) {
    const params = new URLSearchParams(location.search);
    if (sellerId) {
      params.set("sellerId", sellerId);
    } else {
      params.delete("sellerId");
    }
    navigate({ search: params.toString() });
  }

  

  return (
    <div className="container">

      <Header/>
      <Subheader />
      <div className="main">
        <Sidebar />
        <div className="content">
          {loadingUser ? (
            <h3>Ładowanie...</h3>
          ) : user?.is_admin ? (
            <AddNewProduct />
          ) : isLoggedIn ? (
            <h3>brak uprawnień</h3>
          ) : (
            <h3>niezalogowany</h3>
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
                  <button style={{ marginTop: "0.5em" }}>Kup</button>
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
