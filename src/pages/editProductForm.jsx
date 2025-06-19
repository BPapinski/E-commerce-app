import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./utils/cropImage";
import "./styles/newProductForm.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useApi from "./utils/api";

export default function EditProductForm() {
  const { productId } = useParams();
  const { user, loadingUser, isLoggedIn } = useAuth();
  const { authFetch } = useApi();
  const navigate = useNavigate();

  const [productLoaded, setProductLoaded] = useState(false);

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

  useEffect(() => {
    if (loadingUser) return;
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

  }, [loadingUser, isLoggedIn, user, navigate]);

  useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/store/product/${productId}/`);
      const data = await res.json();

      // Sprawdź, czy użytkownik ma prawo edycji (admin lub autor)
      const isOwner = user?.id === data.user;
      const canEdit = user?.is_admin || isOwner;

      if (canEdit && !productLoaded) {
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setCategory(data.category_name || "");
        setCondition(data.condition);
        setProductLoaded(true);
      }
    } catch (err) {
      console.error("Błąd ładowania produktu:", err);
    }
  };

  if (isLoggedIn && !productLoaded) {
    fetchProduct();
  }
}, [authFetch, productId, isLoggedIn, user, productLoaded]);

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
        console.error("Błąd ładowania kategorii:", err);
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
      console.error("Błąd przycinania:", e);
    }
  }, [croppedAreaPixels, imageSrcForCropper]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || !user?.is_admin) {
      alert("Brak uprawnień.");
      return navigate("/login");
    }

    const validCategory = allCategories.find(
      (cat) => cat.name.toLowerCase() === category.toLowerCase()
    );

    if (!validCategory) {
      alert("Nieprawidłowa kategoria.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", validCategory.id);
    formData.append("condition", condition);
    if (croppedFileToSend) {
      formData.append("image", croppedFileToSend, croppedFileToSend.name);
    }

    try {
      const res = await authFetch(
        `http://127.0.0.1:8000/api/store/product/${productId}/`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Błąd:", errorData);
        alert("Błąd zapisu.");
        return;
      }

      alert("Produkt zaktualizowany.");
      navigate("/");
    } catch (err) {
      console.error("Błąd sieci:", err);
      alert("Błąd sieci.");
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

  if (!productLoaded) {
    return <div className="product-form-container"><p>Ładowanie...</p></div>;
  }

  return (
    <div className="product-form-container">
      <Link to="/" className="back-button">Powrót</Link>
      <h2>Edytuj produkt</h2>
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
            required
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

        <label>Stan produktu</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
        >
          <option value="new">Nowy</option>
          <option value="used">Używany</option>
        </select>

        <label>Zdjęcie produktu (opcjonalnie)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
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

        <button type="submit" className="submit-button">Zapisz zmiany</button>
      </form>
    </div>
  );
}
