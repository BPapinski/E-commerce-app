import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./utils/cropImage";
import "./styles/newProductForm.css";
import { Link, useNavigate } from "react-router-dom";

export default function NewProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("new");

  const [imageSrcForCropper, setImageSrcForCropper] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedFileToSend, setCroppedFileToSend] = useState(null);
  const [croppedImagePreviewUrl, setCroppedImagePreviewUrl] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [categoryGroups, setCategoryGroups] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [user, setUser] = useState(null); // Początkowo null
  const [token, setToken] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // Dodany stan ładowania użytkownika
  const [userError, setUserError] = useState(null); // Dodany stan błędu użytkownika

  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (!storedToken) {
      navigate("/");
    }
  }, [navigate]);

  // Pobierz dane użytkownika, jeśli token jest
  useEffect(() => {
    if (!token) {
      setLoadingUser(false); // Jeśli brak tokena, zakończ ładowanie
      return;
    }

    setLoadingUser(true); // Rozpocznij ładowanie
    setUserError(null); // Resetuj błąd
    fetch("http://127.0.0.1:8000/api/user/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/"); // Przekieruj na stronę główną lub logowania
          throw new Error("Nieautoryzowany dostęp. Zaloguj się ponownie.");
        }
        if (!res.ok) {
          throw new Error("Nie udało się pobrać danych użytkownika");
        }
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
        console.log("Dane użytkownika załadowane:", userData);
      })
      .catch((error) => {
        console.error("Błąd użytkownika:", error);
        setUserError(error.message); // Ustaw wiadomość błędu
        // Opcjonalnie przekieruj, jeśli błąd jest krytyczny (np. brak dostępu)
        // navigate("/");
      })
      .finally(() => {
        setLoadingUser(false); // Zawsze zakończ ładowanie po fetchu
      });
  }, [token, navigate]); // navigate jest potrzebne w zależnościach!

  // laoding categories (bez zmian)
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

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSrcForCropper(URL.createObjectURL(file));
      setCroppedFileToSend(null);
      setCroppedImagePreviewUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const generateCroppedFileAndPreview = useCallback(async () => {
    try {
      if (imageSrcForCropper && croppedAreaPixels) {
        const croppedFile = await getCroppedImg(
          imageSrcForCropper,
          croppedAreaPixels
        );
        setCroppedFileToSend(croppedFile);

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

  const handleSubmit = async (e, redirectToHome = false) => {
    e.preventDefault();

    // Dodatkowa walidacja dostępu przed wysłaniem formularza
    if (!user || !user.is_admin) {
        alert("Brak uprawnień administratora do dodawania produktów.");
        navigate("/"); // Przekieruj, jeśli nie jest adminem
        return;
    }

    const validCategory = allCategories.find(
      (cat) => cat.name.toLowerCase() === category.toLowerCase()
    );

    if (!validCategory) {
      alert("Wpisana kategoria nie istnieje. Proszę wybrać kategorię z listy.");
      return;
    }

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
    formData.append("image", croppedFileToSend, croppedFileToSend.name);

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
        navigate("/");
      } else {
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

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setShowSuggestions(value.trim() !== "");
  };

  const handleSuggestionClick = (name) => {
    setCategory(name);
    setShowSuggestions(false);
  };

  // --- Kluczowe zmiany w renderowaniu: ---

  // 1. Pokaż komunikat ładowania, jeśli dane użytkownika są ładowane
  if (loadingUser) {
    return (
      <div className="product-form-container">
        <p>Ładowanie danych użytkownika...</p>
      </div>
    );
  }

  // 2. Pokaż komunikat o błędzie, jeśli wystąpił problem z ładowaniem danych użytkownika
  if (userError) {
    return (
      <div className="product-form-container">
        <p>Błąd ładowania danych użytkownika: {userError}</p>
        <p>Proszę odświeżyć stronę lub spróbować ponownie później.</p>
        <Link to="/" className="back-button">Powrót do strony głównej</Link>
      </div>
    );
  }

  // 3. Sprawdź uprawnienia admina po załadowaniu danych użytkownika
  if (!user || !user.is_admin) {
    return (
      <div className="product-form-container">
        <p>Brak uprawnień. Tylko administratorzy mogą dodawać produkty.</p>
        <Link to="/" className="back-button">Powrót do strony głównej</Link>
      </div>
    );
  }

  // Jeśli wszystko jest ok (user załadowany i jest adminem), renderuj formularz
  return (
    <div className="product-form-container">
      <Link to="/" className="back-button">
        Powrót
      </Link>
      <h2>Dodaj nowy produkt</h2>
      {/* Reszta Twojego formularza */}
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

        {imageSrcForCropper && (
          <button
            type="button"
            onClick={generateCroppedFileAndPreview}
            className="crop-button"
          >
            Przytnij zdjęcie
          </button>
        )}

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