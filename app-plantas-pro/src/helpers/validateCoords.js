export const obtenerDireccion = async (lat, lon) => {
  if (!lat || !lon) return console.error("Faltan coordenadas");

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

  try {
    const res = await fetch(url, { headers: { "Accept-Language": "es" } });
    const data = await res.json();
    const addr = data.address || {};

    // LÓGICA DE JERARQUÍA: Si no hay suburbio, usamos la ciudad.
    // Si no hay ciudad (zonas rurales), usamos el distrito o el estado.
    const distritoLocalidad =
      addr.suburb ||
      addr.city ||
      addr.town ||
      addr.state_district ||
      addr.state ||
      "Sin nombre";
    const estadoRegion = addr.state || addr.region || "Sin nombre";

    // Devolvemos el objeto ya limpio para tu base de datos
    return {
      distrito: distritoLocalidad,
      estado: estadoRegion,
      full_data: data, // Por si necesitas algo más después
    };
  } catch (error) {
    console.error("Error en auditoría:", error);
  }
};

// 2. Anclaje global para que funcione en la consola
if (typeof window !== "undefined") {
  window.auditar = obtenerDireccion;
}

const auditoriaMasiva = async () => {
  const coordenadas = [["-11.97047600", "-77.08061200"]];

  const reporte = []; 

  for (const [lat, lon] of coordenadas) {
    if (!lat || !lon) continue;

    const res = await obtenerDireccion(lat, lon);

    // Creamos el objeto con las columnas que quieres
    reporte.push({
      Latitud: lat,
      Longitud: lon,
      Distrito: res.distrito,

    });
  }

  // El truco maestro: Imprimir todo como una tabla
  console.table(reporte);
};

auditoriaMasiva();