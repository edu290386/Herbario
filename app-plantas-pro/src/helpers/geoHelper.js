// src/helpers/geoHelper.js

/**
 * Obtiene el nombre del distrito y ciudad a partir de coordenadas.
 * Usa la API de Nominatim (OpenStreetMap).
 */
export const obtenerDireccion = async (latitud, longitud) => {
  // 1. VALIDACIÓN PREVIA: Si los datos son nulos, indefinidos o no son números válidos, abortamos.
  if (
    !latitud ||
    !longitud ||
    latitud === "undefined" ||
    longitud === "undefined"
  ) {
    console.warn("geoHelper: Coordenadas no válidas recibidas:", {
      latitud,
      longitud,
    });
    return null;
  }

  try {
    // Construcción de la URL de búsqueda inversa
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}&addressdetails=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept-Language": "es", // Preferimos resultados en español
        // IMPORTANTE: Nominatim exige identificarse. Cambia 'tu-app' por algo descriptivo.
        "User-Agent": "AppBotanicaAdmin/1.0 (https://tu-proyecto-vercel.app)",
      },
    });

    // Si la API responde con error (ej. 403, 429), salimos con null
    if (!response.ok) {
      console.warn(`geoHelper: Error de API ${response.status}`);
      return null;
    }

    const data = await response.json();
    const addr = data.address || {};

    // 2. EXTRACCIÓN INTELIGENTE:
    // Nominatim usa diferentes nombres de campos según la zona del mundo.
    // Buscamos el más específico (suburb) hasta el más general (village).
    const distritoDetectado =
      addr.suburb ||
      addr.city_district ||
      addr.neighbourhood ||
      addr.town ||
      addr.village ||
      "Zona no identificada";

    const ciudadDetectada =
      addr.city || addr.state || addr.county || "Provincia";

    return {
      distrito: distritoDetectado,
      ciudad: ciudadDetectada,
    };
  } catch (error) {
    // Si hay un error de red o CORS, lo capturamos aquí
    console.error(
      "geoHelper: Error de conexión o bloqueo de red:",
      error.message,
    );
    return null;
  }
};

/**
 * Calcula la distancia en línea recta entre dos puntos (Fórmula de Haversine).
 */
export const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;

  return parseFloat(distancia.toFixed(1)); // Retorna un número como 1.5
};
