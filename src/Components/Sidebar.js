import { useState, useEffect } from "react";
import "../pages/styles/sidebar.css";
import toggleSidebar from "../scripts/toggleSidebar";
import $ from "jquery";
import Slider from "./Slider";
import SidebarElement from "./SidebarElement";

export default function Sidebar() {
    const [joinedData, setJoinedData] = useState([]);

    useEffect(() => {
        async function fetchData() {
        try {
            const [categoriesRes, groupsRes] = await Promise.all([
            fetch("http://127.0.0.1:8000/api/store/category/"),
            fetch("http://127.0.0.1:8000/api/store/categorygroup/")
            ]);

            const categoriesData = await categoriesRes.json();
            const groupsData = await groupsRes.json();

            const categories = categoriesData.results || categoriesData;
            const groups = groupsData.results || groupsData;

            //console.log("Groups:", groups);
            //console.log("Categories:", categories);

            // Utwórz mapę: group_id → group_name (upewnij się, że klucze to stringi)
            const groupMap = new Map(
            groups.map(group => [String(group.id), group.name])
            );

            // Wykonaj "LEFT JOIN": dołącz group_name do każdej kategorii
            const result = categories.map(category => {
                const rawGroupId = category.group_id ?? category.group?.id ?? category.group;
                const groupId = String(rawGroupId);
                const groupName = groupMap.get(groupId) || "Brak grupy";

                return {
                    category_name: category.name,
                    group_name: groupName
                };
            });

            //console.log("JOIN result:", result);


            const groupedData = result.reduce((acc, item) => {
            const { group_name } = item;

            if (!acc[group_name]) {
                acc[group_name] = [];
            }

            acc[group_name].push(item); // cały obiekt kategorii
            return acc;
            }, {});

            const groupedArray = Object.entries(groupedData).map(([group_name, categories]) => ({
            group_name,
            categories
            }));

            console.log(groupedArray)

            console.log("dupa")


            setJoinedData(groupedArray);
        } catch (error) {
            console.error("Błąd podczas pobierania danych:", error);
        }
        }

        fetchData();
    }, []);

    return (
        <div className="sidebar">
            <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
            <div className="sidebar-header">
                
            </div>
            
            <div className="slider-element" >
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
