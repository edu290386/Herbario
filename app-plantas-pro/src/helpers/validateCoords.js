// src/helpers/validateCoords.js

export const obtenerDireccion = async (lat, lon) => {
  if (!lat || !lon)
    return { Latitud: lat, Longitud: lon, Distrito: "Faltan datos" };

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();

    // 1. Obtenemos el nombre base usando tu jerarquía
    let nombreLimpio =
      data.locality || data.city || data.principalSubdivision || "Sin nombre";

    // 2. LÓGICA DE LIMPIEZA: Eliminamos "Distrito de", "Provincia de", etc.
    // Usamos una Regex para quitar esos prefijos sin importar mayúsculas
    nombreLimpio = nombreLimpio.replace(
      /^(distrito de|provincia de|departamento de|municipalidad de|pueblo de)\s+/gi,
      "",
    );

    const estadoRegion = (data.principalSubdivision || "Sin nombre").replace(
      /^(departamento de|región de|estado de)\s+/gi,
      "",
    );

    return {
      Latitud: lat,
      Longitud: lon,
      Distrito: nombreLimpio,
      Estado: estadoRegion,
      full_data: data,
    };
  } catch (error) {
    return {
      Latitud: lat,
      Longitud: lon,
      Distrito: "Error: " + error.message,
      Estado: "Fallo",
    };
  }
};

// El anclaje global 'auditar' se mantiene igual que en la versión anterior...

//auditar(["-11.86548400", "-77.01673100"]);
