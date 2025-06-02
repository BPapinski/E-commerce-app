import React, { useState } from "react";


function handleCategoryChoice(categoryName){
  console.log("wybrano kategorie " + categoryName)
  
  const params = new URLSearchParams(window.location.search);
  params.set("category", categoryName);

  // Aktualizuj URL bez przeładowania strony
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, "", newUrl);
}

const SidebarElement = ({ groupName, categories }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className={`sidebar-element ${expanded ? "active" : ""}`}>
      <div
        onClick={handleClick}
        style={{
          cursor: "pointer",
          fontWeight: "bold",
          userSelect: "none",
          padding: "5px 0"
        }}
      >
        {groupName} {expanded ? "▲" : "▼"}
      </div>
      <ul className={`sidebar-subelement ${expanded ? "active" : ""}`}>
        {categories.map((cat, index) => (
          <div>
            <li key={index}>
              <a href="#" onClick={() => handleCategoryChoice(cat.category_name)}>{cat.category_name}</a>
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default SidebarElement;
