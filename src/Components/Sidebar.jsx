import { useState, useEffect } from "react";
import "../pages/styles/sidebar.css";
// import toggleSidebar from "../scripts/toggleSidebar"; // Zakomentowano, jeśli nie jest używane
// import $ from "jquery"; // Zakomentowano, jeśli nie jest używane do manipulacji DOM
import Slider from "./Slider"; // Upewnij się, że ten komponent jest poprawnie zaimportowany
import SidebarElement from "./SidebarElement"; // Upewnij się, że ten komponent jest poprawnie zaimportowany
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [joinedData, setJoinedData] = useState([]);
  const [range, setRange] = useState([0, 100]);
  // Nowy stan dla wybranego stanu produktu (null, 'new', lub 'used')
  const [selectedCondition, setSelectedCondition] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, groupsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/store/category/"),
          fetch("http://127.0.0.1:8000/api/store/categorygroup/"),
        ]);

        const categoriesData = await categoriesRes.json();
        const groupsData = await groupsRes.json();

        const categories = categoriesData.results || categoriesData;
        const groups = groupsData.results || groupsData;

        const groupMap = new Map(
          groups.map((group) => [String(group.id), group.name])
        );

        // Wykonaj "LEFT JOIN": dołącz group_name do każdej kategorii
        const result = categories.map((category) => {
          const rawGroupId =
            category.group_id ?? category.group?.id ?? category.group;
          const groupId = String(rawGroupId);
          const groupName = groupMap.get(groupId) || "Brak grupy";

          return {
            category_name: category.name,
            group_name: groupName,
          };
        });

        const groupedData = result.reduce((acc, item) => {
          const { group_name } = item;

          if (!acc[group_name]) {
            acc[group_name] = [];
          }

          acc[group_name].push(item); // cały obiekt kategorii
          return acc;
        }, {});

        const groupedArray = Object.entries(groupedData).map(
          ([group_name, categories]) => ({
            group_name,
            categories,
          })
        );

        console.log(groupedArray); // Dla celów debugowania

        setJoinedData(groupedArray);
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      }
    }

    fetchData();
  }, []);

  // Funkcja do obsługi zmiany stanu produktu
  const handleConditionChange = (condition) => {
    setSelectedCondition(condition);
  };

  // Funkcja do stosowania filtrów
  function Apply() {
    const [min, max] = range;
    const params = new URLSearchParams(location.search);
    params.set("min_price", min);
    params.set("max_price", max);

    // Dodaj lub usuń parametr 'condition' w zależności od wyboru
    if (selectedCondition) {
      params.set("condition", selectedCondition);
    } else {
      params.delete("condition");
    }

    navigate({ search: params.toString() });
  }

  return (
    <div className="sidebar">
      {/* <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script> */}
      <div className="sidebar-header"></div>

      {/* Sekcja Slidera Cenowego */}
      <div className="slider-element">
        <h1>Cena</h1>
        <Slider range={range} setRange={setRange} />
      </div>

      {/* Sekcja Stanu Produktu */}
      <div className="product-condition">
        <div>
          <h2>Stan produktu</h2>
        </div>
        <div className="product-condition-choose">
          {/* Opcja "Nowy" */}
          <div
            className={`product-condition-option ${selectedCondition === "new" ? "active" : ""}`}
            onClick={() => handleConditionChange("new")}
          >
            <label className="product-condition-checkbox-container">
              Nowy
              <input
                type="checkbox"
                checked={selectedCondition === "new"}
                onChange={() => {}} // Pusty handler, bo klikamy na div
              />
              <span className="checkmark"></span>
            </label>
          </div>

          {/* Opcja "Używany" */}
          <div
            className={`product-condition-option ${selectedCondition === "used" ? "active" : ""}`}
            onClick={() => handleConditionChange("used")}
          >
            <label className="product-condition-checkbox-container">
              Używany
              <input
                type="checkbox"
                checked={selectedCondition === "used"}
                onChange={() => {}} // Pusty handler, bo klikamy na div
              />
              <span className="checkmark"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Przycisk Zastosuj */}
      <div>
        <button onClick={Apply}>Zastosuj</button>
      </div>

      {/* Odstęp - rozważ użycie CSS zamiast <br> */}
      <br></br>

      {/* Sekcja Kategorii */}
      <div className="categories">
        {joinedData.map((group, index) => (
          <SidebarElement
            key={index}
            groupName={group.group_name}
            categories={group.categories}
          />
        ))}
      </div>
    </div>
  );
}