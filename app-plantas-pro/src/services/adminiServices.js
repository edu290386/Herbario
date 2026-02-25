import { supabase } from "../supabaseClient";

// 1. Obtener datos para el Panel de Control
export const getUsuariosAdmin = async () => {
  return await supabase
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: false });
};

// 2. Acción única para actualizar (Status, Grupo, Modo, Hardware)
// Se usa un solo servicio para todo lo que sea modificar la tabla usuarios
export const updateUsuario = async (id, cambios, adminId, accionNombre) => {
  const { data, error } = await supabase
    .from("usuarios")
    .update(cambios)
    .eq("id", id);

  if (!error && adminId) {
    // Registro de log administrativo simplificado
    await supabase.from("logs_accesos").insert([
      {
        admin_id: adminId,
        usuario_id: id,
        accion: accionNombre,
        detalle: cambios,
      },
    ]);
  }
  return { data, error };
};

// 3. Extender tiempo (Lógica de negocio simple)
export const sumarDiasSuscripcion = async (id, dias, fechaActual, adminId) => {
  let base = new Date(fechaActual || new Date());
  if (base < new Date()) base = new Date(); // Si ya venció, empezamos desde hoy

  base.setDate(base.getDate() + dias);

  return await updateUsuario(
    id,
    { suscripcion_vence: base.toISOString(), status: "ACTIVO" },
    adminId,
    `SUMAR_${dias}_DIAS`,
  );
};

// 4. Obtener datos para el Panel de Logs
export const getLogsAccesos = async () => {
  return await supabase
    .from("logs_accesos")
    .select(`*, admin:admin_id(primerNombre), usuario:usuario_id(telefono)`)
    .order("created_at", { ascending: false });
};
