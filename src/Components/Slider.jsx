import { useEffect, useState, useRef } from 'react';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';
import 'jquery-ui/themes/base/all.css';

export default function Slider({range, setRange}) {
  const sliderRef = useRef(null); // Referencja do suwaka

  useEffect(() => {
    $(sliderRef.current).slider({
      range: true,
      min: 0,
      max: 100,
      values: range,
      slide: (event, ui) => {
        setRange(ui.values); // Aktualizacja stanu przy przesuwaniu
      }
    });
  }, []);

  // Kiedy input się zmienia – aktualizujemy i stan, i suwak
  const handleInputChange = (index, value) => {
    const newRange = [...range];
    newRange[index] = Number(value);

    // Zapobiegamy nieprawidłowemu zakresowi
    if (newRange[0] <= newRange[1]) {
      setRange(newRange);
      $(sliderRef.current).slider("values", newRange); // Update jQuery slider
    }
  };

  return (
    <div className="slider-container">
      <div ref={sliderRef} style={{ marginBottom: '10px' }}></div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          <label>min</label>
          <input
            type="number"
            value={range[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            style={{ width: '60px', marginLeft: '5px' }}
          />
        </label>

        <label>
        <label>max</label>
          <input
            type="number"
            value={range[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            style={{ width: '60px', marginLeft: '5px' }}
          />
        </label>
      </div>
    </div>
  );
}
