/**
 * Obtiene el nombre del distrito y ciudad a partir de coordenadas.
 * Usa Nominatim (OpenStreetMap) de forma gratuita.
 */
export const obtenerDireccion = async (latitud, longitud) => {
  if (!latitud || !longitud || latitud === "undefined") return null;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}&addressdetails=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept-Language": "es",
        "User-Agent": "AppBotanicaAdmin/1.0", // Identificador para la API
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const addr = data.address || {};

    // Priorizamos nombres locales para el distrito
    return {
      distrito: addr.suburb || addr.city || "No detectado",
      ciudad: addr.state || addr.region || addr.province || "No detectada",
    };
  } catch {
    // catch vacío para silenciar avisos de variables no usadas
    return null;
  }
};



/**
 * Tu lógica: Cálculo de Distancia Pitagórica (en km).
 * Ideal para distancias cortas donde la curvatura terrestre es despreciable.
 */
export const calcularDistanciaPitagorica = (lat1, lon1, lat2, lon2) => {
  try {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const p1 = { lat: parseFloat(lat1), lon: parseFloat(lon1) };
    const p2 = { lat: parseFloat(lat2), lon: parseFloat(lon2) };

    const x = p2.lat - p1.lat;
    const y = (p2.lon - p1.lon) * Math.cos((p1.lat * Math.PI) / 180);
    const distancia = Math.sqrt(x * x + y * y) * 111.32;

    return distancia; // Retornamos el número puro para poder validarlo
  } catch {
    return null;
  }
};

// NUEVA FUNCIÓN: Procesa toda la lista y decide el estado del GPS
export const procesarUbicacionesConGPS = (ubicaciones, userCoords, errorGPS) => {
  const LIMITE_REALIDAD_KM = 5000;
  let señalInestable = false;

  // 1. Procesar la lista
  const listaProcesada = ubicaciones
    .filter(u => u.latitud && u.longitud)
    .map(ubi => {
      const latUsuario = userCoords?.lat;
      const lonUsuario = userCoords?.lon || userCoords?.lng;
      
      const km = calcularDistanciaPitagorica(latUsuario, lonUsuario, ubi.latitud, ubi.longitud);

      // Si detectamos distancia absurda (Laptop error)
      if (km > LIMITE_REALIDAD_KM) {
        señalInestable = true;
        return { ...ubi, distanciaTexto: null, esReal: false };
      }

      const texto = km ? (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`) : null;
      return { ...ubi, distanciaTexto: texto, esReal: true };
    });

  // 2. Determinar el estado global
  const hayError = errorGPS || señalInestable;
  const status = hayError ? "error" : userCoords ? "success" : "warning";
  
  let mensaje = "🛰️ Esperando señal GPS...";
  if (errorGPS) mensaje = errorGPS;
  else if (señalInestable) mensaje = "Ubicación imprecisa (Señal débil)";
  else if (userCoords) mensaje = `GPS Activo: ${listaProcesada.length} ubicaciones`;

  return {
    ubicacionesProcesadas: listaProcesada,
    statusGps: status,
    mensajeGps: mensaje,
    hayErrorReal: hayError
  };
};