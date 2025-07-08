import styles from "./styles/UserProducts.css";
import Header from "../Components/Header";

export default function UserProducts() {
  const placeholderProducts = [
    {
      id: 57,
      name: "gfgfd",
      description: "gdfdfg",
      price: "43.00",
      image: "http://127.0.0.1:8000/media/products/default.jpg",
      deleted: false,
    },
    {
      id: 58,
      name: "Produkt B",
      description: "Opis produktu B",
      price: "120.00",
      image: "http://127.0.0.1:8000/media/products/default.jpg",
      deleted: false,
    },
    {
      id: 59,
      name: "Produkt C",
      description: "Opis produktu C",
      price: "89.00",
      image: "http://127.0.0.1:8000/media/products/default.jpg",
      deleted: true,
    },
  ];

   return (
    <>
    <Header/>
    <div className="container user-products-container">
      <h1 className="user-products-title">Twoje produkty</h1>
      <div className="products-list">
        {placeholderProducts.map((product) => (
          <div
            key={product.id}
            className={`product-card ${product.deleted ? "deleted" : ""}`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <div className="product-info">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className="product-price">{product.price} zł</p>
              <div className="buttons">
                {!product.deleted && (
                  <>
                    <button className="btn edit">Edytuj</button>
                    <button className="btn delete">Usuń</button>
                  </>
                )}
                {product.deleted && (
                  <button className="btn restore">Przywróć</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
