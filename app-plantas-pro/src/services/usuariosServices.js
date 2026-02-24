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

  // --- APLANAMOS EL DATO PARA QUE SEA FÁCIL DE USAR ---
  if (data && data.grupos) {
    // Creamos una propiedad directa llamada 'grupo'
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
      segundo_nombre: datos.segundoNombre,
      apellido: datos.primerApellido,
      segundo_apellido: datos.segundoApellido,
      documento_identidad: datos.documento_identidad,
      email: datos.correo,
      password: datos.password,
      alias: datos.alias,
      status: "ACTIVO",
      suscripcion_vence: vence.toISOString(),
      [datos.columnaID]: datos.deviceID, // Aquí se guarda el UUID en id_movil o id_laptop
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

export const iniciarSesionSegura = async (telefono, columnaID, deviceID) => {
  const nuevoToken = crypto.randomUUID(); // <--- Mantenemos tu código aleatorio

  const { data, error } = await supabase
    .from("usuarios")
    .update({
      session_id: nuevoToken, // Se guarda el UUID para la expulsión realtime
      [columnaID]: deviceID,
    })
    .eq("telefono", telefono)
    .select(`*, grupos!fk_usuario_grupo(nombre_grupo)`)
    .single();

  if (data?.grupos) data.grupo = data.grupos.nombre_grupo;
  return { data, nuevoToken, error };
};