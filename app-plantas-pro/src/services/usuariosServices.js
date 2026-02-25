import { supabase } from "../supabaseClient";

export const getUsuarioPorTelefono = async (telefono) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      *,
      grupos!fk_usuario_grupo ( 
        nombre_grupo
      )
    `)
    .eq("telefono", telefono)
    .single();

  // Aplanamos el dato para la Home
  if (data && data.grupos) {
    data.grupo = data.grupos.nombre_grupo;
  }

  return { data, error };
};

export const activarUsuario = async (telefono, datos) => {
  const vence = new Date();
  vence.setDate(vence.getDate() + 365);

  const { data, error } = await supabase
    .from("usuarios")
    .update({
      nombre: datos.primerNombre,
      apellido: datos.primerApellido,
      password: datos.password,
      alias: datos.alias,
      status: "ACTIVO",
      suscripcion_vence: vence.toISOString(),
      [datos.columnaID]: datos.deviceID, // id_movil o id_laptop
      updated_at: new Date().toISOString(),
      // IMPORTANTE: Al activar, también inicializamos el modo por defecto
      modo_acceso: "solo_movil" 
    })
    .eq("telefono", telefono)
    .select();

  return { data, error };
};

export const iniciarSesionSegura = async (
  telefono,
  columnaID,
  deviceID,
  nuevoTokenPateador
) => {
  try {
    // 1. Actualización de seguridad y vinculación
    // Usamos el nombre de la relación explícita para evitar errores de servidor
    const { data, error } = await supabase
      .from("usuarios")
      .update({
        [columnaID]: deviceID,
        session_id: crypto.randomUUID(), 
        login_token: nuevoTokenPateador, // El que patea
        status: "ACTIVO",
      })
      .eq("telefono", telefono)
      .select(`
        *,
        grupos!fk_usuario_grupo (
          nombre_grupo
        )
      `)
      .single();

    if (error) throw error;

    // 2. Aplanado del grupo (para la Home)
    if (data && data.grupos) {
      data.grupo = data.grupos.nombre_grupo;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error en iniciarSesionSegura:", error);
    return { data: null, error };
  }
};

export const vincularDispositivo = async (telefono, columnaID, fingerprint) => {
  const { data, error } = await supabase
    .from("usuarios")
    .update({ [columnaID]: fingerprint })
    .eq("telefono", telefono)
    .select();
  return { data, error };
};