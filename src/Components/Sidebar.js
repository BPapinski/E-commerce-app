import { useState, useEffect } from "react";
import "../pages/styles/sidebar.css";
import toggleSidebar from "../scripts/toggleSidebar";
import $ from "jquery";
import Slider from "./Slider";
import SidebarElement from "./SidebarElement";

export default function Sidebar() {



    const [activeCategory, setActiveCategory] = useState();
    const [activeSubcategory, setActiveSubcategory] = useState();

    const handleCategoryClick = (category) => {
        // Zmieniamy URL, dodając kategorię do parametrów
        const url = new URL(window.location); // Dodajemy parametr 'category'
        url.searchParams.delete('subcategory');
        window.history.pushState({}, '', url); // Zmieniamy URL bez przeładowania strony
        setActiveCategory(category);
        //setActiveSubcategory(null); // Resetujemy aktywną podkategorię przy zmianie kategorii
    };

    const handleSubcategoryClick = (category, subcategory) => {
        // Zmieniamy URL, dodając zarówno kategorię, jak i podkategorię do parametrów
        const url = new URL(window.location);
        url.searchParams.set('category', category); // Dodajemy parametr 'category'
        url.searchParams.set('subcategory', subcategory); // Dodajemy parametr 'subcategory'
        window.history.pushState({}, '', url); // Zmieniamy URL bez przeładowania strony
        setActiveCategory(category);
        setActiveSubcategory(subcategory); // Ustawiamy aktywną podkategorię
    };
    

    // Funkcja do sprawdzania, czy kategoria jest aktywna
    const isCategoryActive = (category) => activeCategory === category ? 'active' : '';
    // Funkcja do sprawdzania, czy podkategoria jest aktywna
    const isSubcategoryActive = (subcategory) => activeSubcategory === subcategory ? 'active' : '';




    const categories = [
    {
        category: "Elektronika",
        id: "electronics",
        subcategories: ["Telewizory", "Smartfony", "Laptopy", "Aparaty fotograficzne", "konsole"]
    },
    {
        category: "Odzież",
        id: "clothing",
        subcategories: ["Kurtki", "Spodnie", "T-shirty", "Bluzy"]
    },
    {
        category: "Książki",
        id: "books",
        subcategories: ["Powieści", "Poradniki", "Kryminały", "Literatura dziecięca"]
    },
    {
        category: "Akcesoria",
        id: "accessories",
        subcategories: ["Biżuteria", "Zegarki", "Torby", "Okulary"]
    }
    ];


    return (
        <div className="sidebar">
            <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
            <div className="sidebar-header">
                
            </div>
            
            <div class="sidebar-element slider-element" >
                <h1 > cena</h1>
                    <Slider/>
            </div>

            <div className="product-condition">
                <div>
                    <h2>stan produktu</h2>
                </div>
                <div className="product-condition-choose">
                    <div className="product-condition-option">
                        <label className="product-condition-checkbox-container">Nowy
                            <input type="checkbox"/>
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    
                    <div className="product-condition-option">
                        <label class="product-condition-checkbox-container">Używany
                            <input type="checkbox"/>
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    
                </div>

                

            </div>

            <br></br>

            <div className="categories">
                {categories.map(({ category, id, subcategories }) => (
                    <SidebarElement
                        key={id}
                        category={category}
                        id={id}
                        subcategories={subcategories}
                        isCategoryActive={isCategoryActive}
                        isSubcategoryActive={isSubcategoryActive}
                        toggleSidebar={toggleSidebar}
                        handleCategoryClick={handleCategoryClick}
                        handleSubcategoryClick={handleSubcategoryClick}
                    />
                ))}
            </div>
            
        </div>
    );
}
