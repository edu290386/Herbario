export const abrirWhatsappPlanta = (
  nombrePlanta,
  distrito,
  ciudad,
  latitud,
  longitud,
  distancia,
  telefonoUsuario,
) => {
  const numero = telefonoUsuario.replace(/\D/g, "");
  const nombre = nombrePlanta || "Planta sin nombre";

  // 📍 Nueva URL de mapa más confiable
  const urlMapa = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;

  const mensaje = `¡Hola! Me interesa esta ubicación:
🌿 *Planta:* ${nombre}
📍 *Lugar:* ${ciudad}, ${distrito}
📏 *Distancia:* ${distancia || "Calculando..."}
🗺️ *Ver en Mapa:* ${urlMapa}`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
};
