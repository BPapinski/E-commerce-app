import "../pages/styles/sidebar.css";
import toggleSidebar from "../scripts/toggleSidebar";

export default function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Categories</h2>
            </div>
            <div className="sidebar-element" id="electronics" onClick={(e) => toggleSidebar("electronics", e)}>
                <h2>Electronics</h2>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
            </div>
            <div className="sidebar-element" id="clothing" onClick={(e) => toggleSidebar("clothing", e)}>
                <h2>Clothing</h2>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
            </div>

            <div className="sidebar-element" id="books" onClick={(e) => toggleSidebar("books", e)}>
                <h2>Books</h2>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
            </div>
            <div className="sidebar-element" id="accessories" onClick={(e) => toggleSidebar("accessories", e)}>
                <h2>Accessories</h2>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
                <div className="sidebar-subelement">
                    <a href="#" onClick={(e) => e.stopPropagation()}>Subcategory</a>
                </div>
            </div>
        </div>
    );
}
