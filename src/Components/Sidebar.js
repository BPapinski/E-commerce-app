import "../pages/styles/sidebar.css";
import toggleSidebar from "../scripts/toggleSidebar";

export default function Sidebar() {
    const handleCategoryClick = (category) => {
        // Zmieniamy URL, dodając kategorię do parametrów
        const url = new URL(window.location);
        url.searchParams.set('category', category); // Dodajemy parametr 'category'
        url.searchParams.delete('subcategory');
        window.history.pushState({}, '', url); // Zmieniamy URL bez przeładowania strony
    };

    const handleSubcategoryClick = (category, subcategory) => {
        // Zmieniamy URL, dodając zarówno kategorię, jak i podkategorię do parametrów
        const url = new URL(window.location);
        url.searchParams.set('category', category); // Dodajemy parametr 'category'
        url.searchParams.set('subcategory', subcategory); // Dodajemy parametr 'subcategory'
        window.history.pushState({}, '', url); // Zmieniamy URL bez przeładowania strony
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Kategorie</h2>
            </div>

            {/* Elektronika */}
            <div className="sidebar-element" id="electronics" onClick={(e) => { toggleSidebar("electronics", e); handleCategoryClick("Elektronika"); }}>
                <h2>Elektronika</h2>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Elektronika", "Telewizory"); }}>Telewizory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Elektronika", "Smartfony"); }}>Smartfony</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Elektronika", "Laptopy"); }}>Laptopy</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Elektronika", "Aparaty fotograficzne"); }}>Aparaty fotograficzne</a>
                </div>
            </div>

            {/* Odzież */}
            <div className="sidebar-element" id="clothing" onClick={(e) => { toggleSidebar("clothing", e); handleCategoryClick("Odzież"); }}>
                <h2>Odzież</h2>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Odzież", "Kurtki"); }}>Kurtki</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Odzież", "Spodnie"); }}>Spodnie</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Odzież", "T-shirty"); }}>T-shirty</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Odzież", "Bluzy"); }}>Bluzy</a>
                </div>
            </div>

            {/* Książki */}
            <div className="sidebar-element" id="books" onClick={(e) => { toggleSidebar("books", e); handleCategoryClick("Książki"); }}>
                <h2>Książki</h2>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Książki", "Powieści"); }}>Powieści</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Książki", "Poradniki"); }}>Poradniki</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Książki", "Kryminały"); }}>Kryminały</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Książki", "Literatura dziecięca"); }}>Literatura dziecięca</a>
                </div>
            </div>

            {/* Akcesoria */}
            <div className="sidebar-element" id="accessories" onClick={(e) => { toggleSidebar("accessories", e); handleCategoryClick("Akcesoria"); }}>
                <h2>Akcesoria</h2>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Akcesoria", "Biżuteria"); }}>Biżuteria</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Akcesoria", "Zegarki"); }}>Zegarki</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Akcesoria", "Torby"); }}>Torby</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => { e.stopPropagation(); handleSubcategoryClick("Akcesoria", "Okulary"); }}>Okulary</a>
                </div>
            </div>
        </div>
    );
}
