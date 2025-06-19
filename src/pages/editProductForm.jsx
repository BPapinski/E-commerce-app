import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./utils/cropImage";
import { useAuth } from "../contexts/AuthContext";
import useApi from "./utils/api";
import "./styles/newProductForm.css";

export default function EditProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, loadingUser, isLoggedIn } = useAuth();
  const { authFetch } = useApi();

  const [productLoaded, setProductLoaded] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("new");

  const [imageSrc, setImageSrc] = useState(null);
  const [croppedArea, setCroppedArea] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [categoryGroups, setCategoryGroups] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!loadingUser && !isLoggedIn) navigate("/login");
  }, [loadingUser, isLoggedIn, navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await authFetch(`http://127.0.0.1:8000/api/store/product/${productId}/`);
        if (res.status === 404) return navigate("/");

        const data = await res.json();
        const isOwner = user?.email === data.seller_email;
        const canUserEdit = user?.is_admin || isOwner;
        setCanEdit(canUserEdit);

        if (!canUserEdit) return setProductLoaded(true);

        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setCategory(data.category_name || "");
        setCondition(data.condition);
        setProductLoaded(true);
      } catch (err) {
        console.error("Błąd ładowania produktu:", err);
        navigate("/");
      }
    };

    if (isLoggedIn && !productLoaded) fetchProduct();
  }, [authFetch, productId, isLoggedIn, user, productLoaded, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, groupRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/store/category/"),
          fetch("http://127.0.0.1:8000/api/store/categorygroup/"),
        ]);
        setAllCategories(await categoryRes.json());
        setCategoryGroups(await groupRes.json());
      } catch (err) {
        console.error("Błąd ładowania kategorii:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (productLoaded && !canEdit) {
      navigate("/");
    }
  }, [productLoaded, canEdit, navigate]);

  const groupedSuggestions = categoryGroups
    .map((group) => ({
      groupName: group.name,
      categories: allCategories.filter(
        (cat) => cat.group === group.id && cat.name.toLowerCase().includes(category.toLowerCase())
      ),
    }))
    .filter((group) => group.categories.length > 0);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file));
      setCroppedFile(null);
      setPreviewUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedArea(pixels);
  }, []);

  const generateCroppedFileAndPreview = useCallback(async () => {
    try {
      if (!imageSrc || !croppedArea) return;
      const cropped = await getCroppedImg(imageSrc, croppedArea);
      setCroppedFile(cropped);

      const reader = new FileReader();
      reader.readAsDataURL(cropped);
      reader.onloadend = () => setPreviewUrl(reader.result);
    } catch (err) {
      console.error("Błąd przycinania:", err);
    }
  }, [imageSrc, croppedArea]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) return navigate("/login");

    const foundCategory = allCategories.find(
      (cat) => cat.name.toLowerCase() === category.toLowerCase()
    );
    if (!foundCategory) return

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", foundCategory.id);
    formData.append("condition", condition);
    if (croppedFile) formData.append("image", croppedFile, croppedFile.name);

    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/store/product/${productId}/`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Błąd:", errData);
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Błąd sieci:", err);
    }
  };

  if (!productLoaded) {
    return (
      <div className="product-form-container">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="product-form-container">
      <Link to="/" className="back-button">Powrót</Link>
      <h2>Edytuj produkt</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <label>Nazwa produktu</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Opis produktu</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />

        <label>Cena (PLN)</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />

        <label>Kategoria</label>
        <div className="category-suggestions-wrapper">
          <input
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setShowSuggestions(e.target.value.trim() !== "");
            }}
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
                      onMouseDown={() => {
                        setCategory(cat.name);
                        setShowSuggestions(false);
                      }}
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
        <select value={condition} onChange={(e) => setCondition(e.target.value)} required>
          <option value="new">Nowy</option>
          <option value="used">Używany</option>
        </select>

        <label>Zdjęcie produktu (opcjonalnie)</label>
        <input type="file" accept="image/*" onChange={handleImageFileChange} />

        {imageSrc && (
          <>
            <div className="cropper-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <button type="button" onClick={generateCroppedFileAndPreview} className="crop-button">
              Przytnij zdjęcie
            </button>
          </>
        )}

        {previewUrl && (
          <div className="image-preview">
            <p>Podgląd przyciętego obrazu:</p>
            <img src={previewUrl} alt="Cropped Preview" />
          </div>
        )}

        <button type="submit" className="submit-button">Zapisz zmiany</button>
      </form>
    </div>
  );
}
