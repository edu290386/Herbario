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

// Función para la HomePage (Ligera)
export const getPlantasBasico = async () => {
  const { data, error } = await supabase
    .from("plantas")
    .select(
      `
      id,
      nombre_comun, 
      nombre_cientifico, 
      nombres_secundarios, 
      foto_perfil, 
      busqueda_index
    `,
    )
    .order("nombre_comun", { ascending: true });

  if (error) {
    console.error("Error al obtener plantas:", error.message);
    throw error;
  }
  return data;
};

//RegistroPlantaPage: Registra una ubicación y, si la planta no existe, la crea.
 
export const registrarUbicacionCompleta = async (datos) => {
  const { 
    plantaId, 
    nombreLimpio, 
    usuarioId, 
    urlFoto, 
    coords, 
    datosLugar 
  } = datos;

  let idFinal = plantaId;

  // 1. Lógica de Planta (Si no tenemos ID, la buscamos o creamos)
  if (!idFinal) {
    // Verificamos si ya existe
    const { data: existente } = await supabase
      .from("plantas")
      .select("id")
      .eq("nombre_comun", nombreLimpio)
      .maybeSingle();

    if (existente) {
      idFinal = existente.id;
    } else {
      // Creamos la planta nueva
      const { data: nuevaP, error: errP } = await supabase
        .from("plantas")
        .insert([{ nombre_comun: nombreLimpio }])
        .select()
        .single();
      
      if (errP) throw errP;
      idFinal = nuevaP.id;
    }
  }

  // 2. Insertar Ubicación
  const { data: ubicacion, error: errU } = await supabase
    .from("ubicaciones")
    .insert([
      {
        planta_id: idFinal,
        usuario_id: usuarioId,
        foto_contexto: urlFoto,
        latitud: coords.lat,
        longitud: coords.lng,
        ciudad: datosLugar.ciudad,
        distrito: datosLugar.distrito,
      },
    ])
    .select()
    .single();

  if (errU) throw errU;

  return { idFinal, ubicacion };
};