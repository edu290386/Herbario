export const generarRutas = (lat, lng) => {
  return {
    // Google Maps con pin directo
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    // Waze con fijación de destino y navegación
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };
};
