// src/helpers/geoHelper.js

export const obtenerDireccion = async (latitud, longitud) => {
  // Verificación básica antes de disparar el fetch
  if (!latitud || !longitud) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}&addressdetails=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept-Language": "es",
        // IMPORTANTE: Nominatim requiere un User-Agent para no dar error de red/CORS
        "User-Agent": "AppBotanicaPersonal/1.0 (contacto@tu-email.com)",
      },
    });

    if (!response.ok) {
      console.warn("Respuesta de API no exitosa:", response.status);
      return null;
    }

    const data = await response.json();

    // Extraemos los datos con seguridad (usando opcionales para evitar errores si no vienen)
    const addr = data.address || {};

    return {
      distrito:
        addr.suburb ||
        addr.city_district ||
        addr.neighbourhood ||
        addr.town ||
        addr.village ||
        "Distrito",
      ciudad: addr.city || addr.state || addr.county || "Ciudad",
    };
  } catch (error) {
    // Si llegas aquí, es un error de red (Failed to fetch)
    console.error("Error de red en geoHelper:", error.message);
    return null;
  }
};
