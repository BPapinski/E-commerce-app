export const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  const image = new Image();
  image.src = imageSrc;

  // Czekaj, aż obraz się załaduje
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

  return new Promise(resolve => {
    // Zwraca URL base64. Jeśli potrzebujesz Bloba (pliku), zmień na canvas.toBlob()
    canvas.toDataURL('image/jpeg', 0.8, (dataUrl) => {
      resolve(dataUrl);
    });
  });
};