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
  const { error } = await supabase
    .from("usuarios")
    .update({
      nombre_completo: datos.nombre,
      email: datos.correo,
      password: datos.password,
      status: "ACTIVO",
    })
    .eq("telefono", telefono);

  return { error };
};