export default function toggleSidebar(divid, e) {
    // Sprawdzenie, czy kliknięcie miało miejsce w tagu <a>
    if (e.target.tagName === 'A') {
        return; // Jeśli kliknięto w link, nie rób nic
    }

    var element = document.getElementById(divid);
    if (!element) return;

    const subelements = element.querySelectorAll(".sidebar-subelement");

    subelements.forEach(sub => {
        sub.classList.toggle("active");  // Dodajemy lub usuwamy klasę 'active'
    });
}