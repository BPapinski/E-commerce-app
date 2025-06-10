import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
// Teraz getCroppedImg zwraca obiekt File (Blob)
import { getCroppedImg } from "./utils/cropImage";
import "./styles/newProductForm.css";
import { Link, useNavigate } from "react-router-dom";

export default function NewProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("new");

  const [imageSrcForCropper, setImageSrcForCropper] = useState(null); // URL dla Croppera (z `URL.createObjectURL`)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedFileToSend, setCroppedFileToSend] = useState(null); // <-- NOWY STAN: przycięty plik do wysłania
  const [croppedImagePreviewUrl, setCroppedImagePreviewUrl] = useState(null); // URL Base64 dla podglądu (opcjonalny, jeśli chcesz podgląd)

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [categoryGroups, setCategoryGroups] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Pobierz dane użytkownika, jeśli token jest
  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/user/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nie udało się pobrać danych użytkownika");
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
        console.log(userData);
      })
      .catch((error) => {
        console.error("Błąd użytkownika:", error);
      });
  }, [token]);

  // laoding categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, groupRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/store/category/"),
          fetch("http://127.0.0.1:8000/api/store/categorygroup/"),
        ]);
        const categoryData = await categoryRes.json();
        const groupData = await groupRes.json();
        setAllCategories(categoryData);
        setCategoryGroups(groupData);
      } catch (err) {
        console.error("category loading error:", err);
      }
    };
    fetchData();
  }, []);

  const groupedSuggestions = categoryGroups
    .map((group) => {
      const matches = allCategories.filter(
        (cat) =>
          cat.group === group.id &&
          cat.name.toLowerCase().includes(category.toLowerCase())
      );
      return {
        groupName: group.name,
        categories: matches,
      };
    })
    .filter((group) => group.categories.length > 0);

  const onCropComplete = useCallback((_, newCroppedAreaPixels) => {
    setCroppedAreaPixels(newCroppedAreaPixels);
  }, []);

  // Obsługa wyboru pliku: ustawia tylko URL dla Croppera
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSrcForCropper(URL.createObjectURL(file));
      setCroppedFileToSend(null); // Resetuj przycięty plik do wysłania
      setCroppedImagePreviewUrl(null); // Resetuj podgląd
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  // Funkcja do generowania PRZYCIĘTEGO PLIKU I PODGLĄDU
  const generateCroppedFileAndPreview = useCallback(async () => {
    try {
      if (imageSrcForCropper && croppedAreaPixels) {
        // getCroppedImg teraz zwraca obiekt File (Blob)
        const croppedFile = await getCroppedImg(
          imageSrcForCropper,
          croppedAreaPixels
        );
        setCroppedFileToSend(croppedFile); // <-- ZAPISUJEMY PRZYCIĘTY PLIK DO WYSŁANIA

        // Opcjonalnie: utwórz URL Base64 dla PODGLĄDU, jeśli chcesz go wyświetlać
        const reader = new FileReader();
        reader.readAsDataURL(croppedFile);
        reader.onloadend = () => {
          setCroppedImagePreviewUrl(reader.result);
        };
      }
    } catch (e) {
      console.error("Błąd podczas generowania przyciętego pliku/podglądu:", e);
    }
  }, [croppedAreaPixels, imageSrcForCropper]);

  // --- Główna funkcja do wysyłania formularza ---
  const handleSubmit = async (e, redirectToHome = false) => {
    e.preventDefault();
    const validCategory = allCategories.find(
      (cat) => cat.name.toLowerCase() === category.toLowerCase()
    );

    if (!validCategory) {
      alert("Wpisana kategoria nie istnieje. Proszę wybrać kategorię z listy.");
      return;
    }

    // Walidacja, czy przycięty plik jest gotowy do wysłania
    if (!croppedFileToSend) {
      alert("Proszę przyciąć zdjęcie, klikając 'Przytnij zdjęcie'.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", validCategory.id);
    formData.append("condition", condition);

    // *** KLUCZOWA ZMIANA: Dodajemy PRZYCIĘTY PLIK do FormData ***
    formData.append("image", croppedFileToSend, croppedFileToSend.name); // croppedFileToSend jest już obiektem File

    const url = "http://127.0.0.1:8000/api/store/product/add/";

    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      alert("Jesteś niezalogowany. Proszę się zalogować.");
      console.error("Brak tokena uwierzytelniającego.");
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Błąd odpowiedzi serwera:",
          response.status,
          response.statusText
        );
        console.error("Szczegóły błędu:", errorData);

        let errorMessage = `Wystąpił błąd: ${response.status} ${response.statusText}.`;
        if (errorData && typeof errorData === "object") {
          for (const key in errorData) {
            if (Object.hasOwnProperty.call(errorData, key)) {
              errorMessage += `\n${key}: ${JSON.stringify(errorData[key])}`;
            }
          }
        } else if (typeof errorData === "string") {
          errorMessage += `\nSzczegóły: ${errorData}`;
        }
        alert(errorMessage);
        return;
      }

      const data = await response.json();
      console.log("Produkt dodany pomyślnie:", data);
      alert("Produkt został dodany pomyślnie!");

      if (redirectToHome) {
        navigate("/"); // Przekieruj na stronę główną
      } else {
        // Odśwież formularz, ale nie odświeżaj całej strony przeglądarki
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setCondition("new");
        setImageSrcForCropper(null);
        setCroppedAreaPixels(null);
        setCroppedFileToSend(null);
        setCroppedImagePreviewUrl(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }
    } catch (error) {
      console.error("Błąd podczas dodawania produktu (catch):", error);
      alert(`Wystąpił błąd sieciowy lub nieoczekiwany: ${error.message}`);
    }
  };

  // Obsługa zmiany kategorii w polu tekstowym (dla sugestii)
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setShowSuggestions(value.trim() !== "");
  };

  // Obsługa kliknięcia sugestii kategorii
  const handleSuggestionClick = (name) => {
    setCategory(name);
    setShowSuggestions(false);
  };

  return (
    <div className="product-form-container">
      <Link to="/" className="back-button">
        Powrót
      </Link>
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
                  <strong
                    style={{
                      padding: "10px",
                      display: "block",
                      background: "#f7f7f7",
                    }}
                  >
                    {group.groupName}
                  </strong>
                  {group.categories.map((cat) => (
                    <div
                      key={cat.id}
                      onMouseDown={() => handleSuggestionClick(cat.name)}
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

        <label htmlFor="condition">Stan produktu</label>
        <select
          id="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
        >
          <option value="new">Nowy</option>
          <option value="used">Używany</option>
        </select>

        <label>Zdjęcie produktu (1:1)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          required
        />

        {imageSrcForCropper && (
          <div className="cropper-container">
            <Cropper
              image={imageSrcForCropper}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {/* Zmieniono nazwę funkcji wywoływanej przez przycisk */}
        {imageSrcForCropper && (
          <button
            type="button"
            onClick={generateCroppedFileAndPreview}
            className="crop-button"
          >
            Przytnij zdjęcie
          </button>
        )}

        {/* Podgląd przyciętego obrazu (opcjonalny, jeśli chcesz wyświetlać Base64) */}
        {croppedImagePreviewUrl && (
          <div className="image-preview">
            <p>Podgląd przyciętego obrazu:</p>
            <img src={croppedImagePreviewUrl} alt="Cropped Preview" />
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          onClick={(e) => handleSubmit(e, false)}
        >
          Zapisz i dodaj kolejny
        </button>
        <button
          type="submit"
          className="submit-button"
          onClick={(e) => handleSubmit(e, true)}
        >
          Zapisz
        </button>
      </form>
    </div>
  );
}
