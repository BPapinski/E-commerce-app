// utils/cropImage.js (PO MODYFIKACJI)
// Importuj uuid, jeśli nie masz go już w utils/cropImage.js
import { v4 as uuidv4 } from 'uuid'; // Dodaj ten import, jeśli potrzebny

export const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  const image = new Image();
  image.src = imageSrc;

  await new Promise(resolve => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x * scaleX,
    croppedAreaPixels.y * scaleY,
    croppedAreaPixels.width * scaleX,
    croppedAreaPixels.height * scaleY,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve, reject) => {
    // Zwraca obiekt Blob
    canvas.toBlob(blob => {
      if (!blob) {
        console.error('Canvas is empty');
        reject(new Error('Canvas is empty'));
        return;
      }
      // Domyślna nazwa pliku dla Bloba
      const filename = `cropped_image_${uuidv4()}.jpeg`;
      // Dodajemy nazwę pliku do Bloba (lub tworzymy nowy obiekt File z Bloba)
      const croppedFile = new File([blob], filename, { type: 'image/jpeg' });
      resolve(croppedFile); // Zwracamy obiekt File (który jest typem Bloba)
    }, 'image/jpeg', 0.8); // Format (jpeg), jakość (0.8)
  });
};