// SidebarElement.js
import React, { useState } from 'react';

const SidebarElement = ({ id, title, subcategories, toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false); // stan, który będzie kontrolował rozwinięcie
  const handleToggle = (e) => {
    // Zatrzymanie propagacji kliknięcia, by nie wywołać toggleSidebar
    e.stopPropagation();
    // Zmiana stanu isOpen
    setIsOpen(!isOpen);
    toggleSidebar(id, e); // Obsługuje toggle dla całego sidebaru
  };

  return (
    <div className="sidebar-element" id={id} onClick={handleToggle}>
      <h2>{title}</h2>
      {subcategories.map((subcategory, index) => (
        <div key={index} className={`sidebar-subelement ${isOpen ? 'open' : 'hidden'}`}>
          <a href="#" onClick={(e) => e.stopPropagation()}>{subcategory}</a>
        </div>
      ))}
    </div>
  );
};

export default SidebarElement;
