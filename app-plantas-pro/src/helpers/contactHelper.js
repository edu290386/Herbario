export const abrirWhatsappPlanta = (nombrePlanta, distrito, ciudad, distancia, latitud, longitud, telefonoUsuario) => {
  const numero = telefonoUsuario.replace(/\D/g, "");

  // Usamos el nombre que tú ya normalizaste para la DB
  const nombre = nombrePlanta || "Planta sin nombre";

  const mensaje = `¡Hola! Me interesa esta ubicación:
🌿 *Planta:* ${nombre}
📍 *Lugar:* ${ciudad}, ${distrito}
📏 *Distancia:* ${distancia || "Calculando..."}
🗺️ *Ver en Mapa:* https://www.google.com/maps?q=${latitud},${longitud}`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
};
