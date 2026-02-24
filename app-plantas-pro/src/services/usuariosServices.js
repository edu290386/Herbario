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
  // Calculamos 365 días de suscripción desde hoy
  const vence = new Date();
  vence.setDate(vence.getDate() + 365);

  const { data, error } = await supabase
    .from("usuarios")
    .update({
      nombre: datos.primerNombre,
      segundo_nombre: datos.segundoNombre,
      apellido: datos.primerApellido,
      segundo_apellido: datos.segundoApellido,
      documento_identidad: datos.documento_identidad,
      email: datos.correo,
      password: datos.password,
      alias: datos.alias,
      status: "ACTIVO",
      suscripcion_vence: vence.toISOString(),
      [datos.columnaID]: datos.deviceID, // Vinculamos el equipo en el registro
      updated_at: new Date().toISOString(),
    })
    .eq("telefono", telefono)
    .select();
  return { data, error };
};

export const vincularDispositivo = async (telefono, columnaID, fingerprint) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .update({ [columnaID]: fingerprint })
      .eq("telefono", telefono)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// services/usuariosServices.js
export const iniciarSesionSegura = async (telefono, columnaID, deviceID) => {
  const nuevoToken = crypto.randomUUID();

  // Preparamos la actualización
  const updates = {
    session_id: nuevoToken,
    updated_at: new Date().toISOString(),
  };

  // Si la columna del equipo está vacía, lo vinculamos ahora
  // Si ya tiene un ID, el LoginScreen ya lo validó antes de llamar aquí
  updates[columnaID] = deviceID;

  const { data, error } = await supabase
    .from("usuarios")
    .update(updates)
    .eq("telefono", telefono)
    .select()
    .single();

  return { data, nuevoToken, error };
};