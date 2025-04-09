import React from "react";

const SidebarElement = ({
  category,
  id,
  subcategories,
  isCategoryActive,
  isSubcategoryActive,
  toggleSidebar,
  handleCategoryClick,
  handleSubcategoryClick,
}) => {
  return (
    <div
      className={`sidebar-element ${isCategoryActive(category)}`}
      id={id}
      onClick={(e) => {
        toggleSidebar(id, e);
        handleCategoryClick(category);
      }}
    >
      <h2>{category}</h2>
      {subcategories.map((sub) => (
        <div className="sidebar-subelement" key={sub}>
          <a
            href="#"
            className={isSubcategoryActive(sub)}
            onClick={(e) => {
              e.stopPropagation();
              handleSubcategoryClick(category, sub);
            }}
          >
            {sub}
          </a>
        </div>
      ))}
    </div>
  );
};

export default SidebarElement;
