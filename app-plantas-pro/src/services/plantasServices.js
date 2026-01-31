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
    nombreCientifico = null,
    nombresSecundarios = null,
    usuarioId, 
    urlFoto, 
    coords, 
    datosLugar 
  } = datos;

  let idFinal = plantaId;
  let plantaData = null; // 1. Se declara aquí

  // --- 1. Lógica de Planta --- Traigo de supabase info de planta por nombre
  if (!idFinal) {
    const { data: existente } = await supabase
      .from("plantas")
      .select("*")
      .eq("nombre_comun", nombreLimpio)
      .maybeSingle();

    if (existente) {
      idFinal = existente.id;
      plantaData = existente; // 2. Se asigna si existe
    } else {
      const { data: nuevaP, error: errP } = await supabase
        .from("plantas")
        .insert([{ 
            nombre_comun: nombreLimpio,
            nombre_cientifico: nombreCientifico,
            nombres_secundarios: nombresSecundarios
        }])
        .select()
        .single();
      
      if (errP) throw errP;

      idFinal = nuevaP.id;
      plantaData = nuevaP; // 3. Se asigna si es nueva
    }
  } else {
    const { data: existente } = await supabase
      .from("plantas")
      .select("*")
      .eq("id", idFinal)
      .single();
    plantaData = existente;
    console.log(plantaData) // 4. Se asigna si ya teníamos el ID
  }

  // --- 2. Lógica de Ubicación ---
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

  // --- 3. RETORNO (Aquí es donde se "usa" plantaData) ---
  return {
    id: idFinal,
    nombre_comun: plantaData.nombre_comun,
    nombre_cientifico: plantaData.nombre_cientifico,
    nombres_secundarios: plantaData.nombres_secundarios,
    foto_perfil: plantaId ? plantaData.foto_perfil : null,
    ultima_ubicacion: ubicacion 
  };
};