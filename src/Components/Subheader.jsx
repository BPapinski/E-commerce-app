import "./styles/Subheader.css"

export default function Subheader() {
  return (
    <div className="subheader">
      {[
        "Wyprzedaże i Promocje",
        "Ekskluzywne Oferty",
        "Darmowa Dostawa",
        "Gwarancja Najniższej Ceny",
        "Bezpieczne Transakcje",
        "Polityka Prywatności",
        "Ochrona Kupujących",
      ].map((text, index) => (
        <div key={index} className="subheader-element">
          <h2>{text}</h2>
        </div>
      ))}
    </div>
  );
}
