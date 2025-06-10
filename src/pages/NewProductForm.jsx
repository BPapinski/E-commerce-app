import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./utils/cropImage"; // funkcja pomocnicza niżej
import { v4 as uuidv4 } from 'uuid';
import "./styles/newProductForm.css"
import { Link } from "react-router-dom"; // <-- Dodaj ten import

export default function NewProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [categoryGroups, setCategoryGroups] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [token, setToken] = useState(null);

useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
}, []);

  const groupedSuggestions = categoryGroups.map((group) => {
    const matches = allCategories.filter(
      (cat) =>
        cat.group === group.id &&
        cat.name.toLowerCase().includes(category.toLowerCase())
    );
    return {
      groupName: group.name,
      categories: matches
    };
  }).filter(group => group.categories.length > 0);


  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const showCroppedImage = useCallback(async () => {
    try {
      const cropped = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(cropped);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, image]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const validCategory = allCategories.find(
      (cat) => cat.name.toLowerCase() === category.toLowerCase()
    );

    if (!validCategory) {
      alert("Wpisana kategoria nie istnieje.");
      return;
    }

    const productData = {
      name,
      description,
      price,
      category: validCategory.id,
      condition: "new",
      image: croppedImage,
    };

    console.log("New Product:", productData);
    alert("Produkt został dodany (symulacja).");

    const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price);
        formData.append('category', productData.category);
        formData.append('condition', productData.condition);

        // Jeśli croppedImage jest obiektem File lub Blob, dodaj go w ten sposób:
        if (productData.image instanceof File || productData.image instanceof Blob) {
        formData.append('image', productData.image, productData.image.name); // trzeci argument jest opcjonalny (nazwa pliku)
        } else if (productData.image) {
        // Jeśli croppedImage to np. base64 string, możesz go dodać jako zwykłe pole tekstowe
        // Pamiętaj, że backend musi być przygotowany na dekodowanie base64
        formData.append('image', productData.image);
    }

    const url = 'http://127.0.0.1:8000/api/store/product/add/'

    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      alert("Jesteś niezalogowany. Proszę się zalogować.");
      console.error("Brak tokena uwierzytelniającego.");
      return; // Zatrzymaj proces, jeśli tokena brakuje
    }

    fetch(url, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${currentToken}`,
        },
        body: formData,
    })

  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, groupRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/store/category/"),
          fetch("http://127.0.0.1:8000/api/store/categorygroup/")
        ]);
        const categoryData = await categoryRes.json();
        const groupData = await groupRes.json();
        setAllCategories(categoryData);
        setCategoryGroups(groupData);
      } catch (err) {
        console.error("Błąd ładowania danych:", err);
      }
    };
    fetchData();
  }, []);


  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);

    if (value.trim() === "") {
      setFilteredCategories([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (name) => {
    setCategory(name);
    setShowSuggestions(false);
  };

  return (
    <div className="product-form-container">
      {/* Dodajemy przycisk "Powrót" tutaj */}
      <Link to="/" className="back-button">Powrót</Link> 
        {token}
      <h2>Dodaj nowy produkt</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <label>Nazwa produktu</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Opis produktu</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />

        <label>Cena (PLN)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <label>Kategoria</label>
        <div className="category-suggestions-wrapper">
          <input
            type="text"
            value={category}
            onChange={handleCategoryChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          />
          {showSuggestions && groupedSuggestions.length > 0 && (
            <ul className="suggestions-box">
              {groupedSuggestions.map((group) => (
                <li key={group.groupName}>
                  <strong style={{ padding: "10px", display: "block", background: "#f7f7f7" }}>
                    {group.groupName}
                  </strong>
                  {group.categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleSuggestionClick(cat.name)}
                      className="suggestion-item"
                    >
                      {cat.name}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>

        <label>Zdjęcie produktu (1:1)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {image && (
          <div className="cropper-container">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {image && (
          <button type="button" onClick={showCroppedImage} className="crop-button">
            Przytnij zdjęcie
          </button>
        )}

        {croppedImage && (
          <div className="image-preview">
            <p>Podgląd:</p>
            <img src={croppedImage} alt="Cropped" />
          </div>
        )}

        <button type="submit" className="submit-button">
          Dodaj produkt
        </button>
      </form>
    </div>
  );
}   