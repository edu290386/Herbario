export const PAISES_CONFIG = [
  { id: "PE", nombre: "Perú", bandera: "🇵🇪" },
  { id: "VE", nombre: "Venezuela", bandera: "🇻🇪" },
  { id: "CO", nombre: "Colombia", bandera: "🇨🇴" },
  { id: "EC", nombre: "Ecuador", bandera: "🇪🇨" },
  { id: "AR", nombre: "Argentina", bandera: "🇦🇷" },
  { id: "BR", nombre: "Brasil", bandera: "🇧🇷" },
  { id: "MX", nombre: "México", bandera: "🇲🇽" },
  { id: "CU", nombre: "Cuba", bandera: "🇨🇺" },
  { id: "CL", nombre: "Chile", bandera: "🇨🇱" },
  { id: "ES", nombre: "España", bandera: "🇪🇸" },
  { id: "world", nombre: "Mundo", bandera: "🌍" },
  { id: "yoruba", nombre: "Yoruba", bandera: "✨" },
];

// Helper para obtener bandera por ID rápido
export const obtenerBandera = (id) => {
  const pais = PAISES_CONFIG.find((p) => p.id === id);
  return pais ? pais.bandera : "🏳️";
};
