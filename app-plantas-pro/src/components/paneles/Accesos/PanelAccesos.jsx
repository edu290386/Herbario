// Dentro de PanelAccesos.jsx

const [nuevoAcceso, setNuevoAcceso] = useState({
  telefono: "",
  modo_acceso: "solo_movil", // Valor por defecto
});

const handleCrearAcceso = async () => {
  // 1. Limpiamos el número (solo dígitos)
  const numLimpio = nuevoAcceso.telefono.replace(/\D/g, "");

  if (numLimpio.length < 6) return alert("Número no válido");

  // 2. Llamada directa a Supabase (sin logs todavía)
  const { error } = await supabase.from("usuarios").insert([
    {
      telefono: numLimpio,
      modo_acceso: nuevoAcceso.modo_acceso,
      status: "PENDIENTE",
    },
  ]);

  if (!error) {
    alert("Número habilitado correctamente");
    setNuevoAcceso({ telefono: "", modo_acceso: "solo_movil" });
    // Aquí llamarías a la función que refresca tu tabla de usuarios
  } else {
    alert("Error: El número ya existe o hubo un fallo de red");
  }
};
