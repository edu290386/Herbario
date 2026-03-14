import { supabase } from "../supabaseClient";

export const getUsuarioPorTelefono = async (telefono) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select(
      `
      *,
      grupos!fk_usuario_grupo ( 
        nombre_grupo
      )
    `,
    )
    .eq("telefono", telefono)
    .single();

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
      [datos.columnaID]: datos.deviceID,
      updated_at: new Date().toISOString(),
      modo_acceso: "solo_movil",
    })
    .eq("telefono", telefono)
    .select();

  return { data, error };
};

export const iniciarSesionSegura = async (
  telefono,
  columnaID,
  deviceID,
  nuevoTokenPateador,
) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .update({
        [columnaID]: deviceID,
        session_id: crypto.randomUUID(),
        login_token: nuevoTokenPateador,
        status: "ACTIVO",
      })
      .eq("telefono", telefono)
      .select(
        `
        *,
        grupos!fk_usuario_grupo (
          nombre_grupo
        )
      `,
      )
      .single();

    if (error) throw error;

    // 🟢 ELIMINAMOS EL BLOQUE QUE CREABA 'data.grupo'
    // Ahora solo devolvemos el objeto tal cual sale de la base de datos.

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
