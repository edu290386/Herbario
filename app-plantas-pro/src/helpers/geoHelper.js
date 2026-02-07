/**
 * Obtiene el nombre del distrito y ciudad a partir de coordenadas.
 * Usa Nominatim (OpenStreetMap) de forma gratuita.
 */
export const obtenerDireccion = async (lat, lon) => {
  if (!lat || !lon) return null;

  // Cambiamos a BigDataCloud para evitar que el Registro se bloquee por CORS
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error en el servidor de mapas");

    const data = await res.json();

    // 1. Aplicamos tu jerarquía de Administrador
    let nombreLimpio =
      data.locality || data.city || data.principalSubdivision || "Sin nombre";

    // 2. Limpieza de prefijos para que en tu BD entre el nombre directo
    nombreLimpio = nombreLimpio.replace(
      /^(distrito de|provincia de|departamento de|municipalidad de)\s+/gi,
      "",
    );

    // 3. Devolvemos el objeto con la estructura que tu formulario ya usa
    return {
      distrito: nombreLimpio,
      estado: data.principalSubdivision || "Sin nombre",
      full_data: data,
    };
  } catch (error) {
    console.error("Error en registro de ubicación:", error.message);
    return { distrito: "Error", estado: "Error" };
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