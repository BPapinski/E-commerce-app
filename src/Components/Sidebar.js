import { useState } from "react";
import "../pages/styles/sidebar.css";
import toggleSidebar from "../scripts/toggleSidebar";

export default function Sidebar() {

    const [activeCategory, setActiveCategory] = useState();
    const [activeSubcategory, setActiveSubcategory] = useState();

    const handleCategoryClick = (category) => {
        // Zmieniamy URL, dodając kategorię do parametrów
        const url = new URL(window.location);
        url.searchParams.set('category', category); // Dodajemy parametr 'category'
        url.searchParams.delete('subcategory');
        window.history.pushState({}, '', url); // Zmieniamy URL bez przeładowania strony
        setActiveCategory(category);
        setActiveSubcategory(null); // Resetujemy aktywną podkategorię przy zmianie kategorii
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

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Kategorie</h2>
                <h2>{activeCategory}</h2>
            </div>

            {/* Elektronika */}
            <div className={`sidebar-element ${isCategoryActive("Elektronika")}`} id="electronics" onClick={(e) => { toggleSidebar("electronics", e); handleCategoryClick("Elektronika"); }}>
                <h2>Elektronika</h2>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Telewizory")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Elektronika", "Telewizory"); }}>Telewizory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Smartfony")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Elektronika", "Smartfony"); }}>Smartfony</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Laptopy")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Elektronika", "Laptopy"); }}>Laptopy</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Aparaty fotograficzne")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Elektronika", "Aparaty fotograficzne"); }}>Aparaty fotograficzne</a>
                </div>
            </div>

            {/* Odzież */}
            <div className={`sidebar-element ${isCategoryActive("Odzież")}`} id="clothing" onClick={(e) => { toggleSidebar("clothing", e); handleCategoryClick("Odzież"); }}>
                <h2>Odzież</h2>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Kurtki")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Odzież", "Kurtki"); }}>Kurtki</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Spodnie")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Odzież", "Spodnie"); }}>Spodnie</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("T-shirty")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Odzież", "T-shirty"); }}>T-shirty</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Bluzy")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Odzież", "Bluzy"); }}>Bluzy</a>
                </div>
            </div>

            {/* Książki */}
            <div className={`sidebar-element ${isCategoryActive("Książki")}`} id="books" onClick={(e) => { toggleSidebar("books", e); handleCategoryClick("Książki"); }}>
                <h2>Książki</h2>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Powieści")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Książki", "Powieści"); }}>Powieści</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Poradniki")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Książki", "Poradniki"); }}>Poradniki</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Kryminały")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Książki", "Kryminały"); }}>Kryminały</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Literatura dziecięca")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Książki", "Literatura dziecięca"); }}>Literatura dziecięca</a>
                </div>
            </div>

            {/* Akcesoria */}
            <div className={`sidebar-element ${isCategoryActive("Akcesoria")}`} id="accessories" onClick={(e) => { toggleSidebar("accessories", e); handleCategoryClick("Akcesoria"); }}>
                <h2>Akcesoria</h2>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Biżuteria")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Akcesoria", "Biżuteria"); }}>Biżuteria</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Zegarki")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Akcesoria", "Zegarki"); }}>Zegarki</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Torby")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Akcesoria", "Torby"); }}>Torby</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" className={isSubcategoryActive("Okulary")} onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Akcesoria", "Okulary"); }}>Okulary</a>
                </div>
            </div>
        </div>
    );
}
