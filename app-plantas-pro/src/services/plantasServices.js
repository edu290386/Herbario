import { supabase } from "../supabaseClient"; // Ajusta la ruta

// Función para traer todo el detalle
export const getDetallePlanta = async (idPlanta) => {
    
  const respuesta = await supabase
    .from("plantas")
    .select(
      `
      *,
      ubicaciones!fk_ubicacion_planta (
        *,
        usuarios!ubicaciones_usuario_id_fkey (
          nombre_completo,
          grupos!fk_usuario_grupo (
            nombre_grupo
          )
        )
      )
    `,
    )
    .eq("id", idPlanta)
    .single();

  if (respuesta.error) {
    console.error("Error en servicio:", respuesta.error);
    throw respuesta.error;
  }
  return respuesta.data;
};

// Función para eliminar ubicación
export const deleteUbicacion = async (idUbicacion, idUsuario) => {
  const { error } = await supabase
    .from("ubicaciones")
    .delete()
    .eq("id", idUbicacion)
    .eq("usuario_id", idUsuario); // Seguridad: solo el dueño borra

  if (error) throw error;
  return true;
};
