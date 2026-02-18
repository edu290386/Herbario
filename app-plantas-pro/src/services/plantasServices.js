import { supabase } from "../supabaseClient";

/**
 * CONSULTAS (GET)
 */

// 1. Detalle completo de planta (filtra ubicaciones por grupo del usuario)
export const getDetallePlanta = async (idPlanta, nombreGrupoUsuario) => {
  const { data: planta, error } = await supabase
    .from("plantas")
    .select(
      `
      *,
      nombres_planta: nombres,
      ubicaciones!fk_ubicacion_planta (
        *,
        usuarios!ubicaciones_usuario_id_fkey (
          nombre, apellido, alias,
          grupos!fk_usuario_grupo ( nombre_grupo )
        )
      )
    `,
    )
    .eq("id", idPlanta)
    .single();

  if (error) throw error;

  const ubicacionesDelGrupo =
    planta.ubicaciones?.filter(
      (u) => u.usuarios?.grupos?.nombre_grupo === nombreGrupoUsuario,
    ) || [];

  return { ...planta, ubicaciones: ubicacionesDelGrupo };
};

// 2. Carga ligera para la galería de la HomePage
export const getPlantasBasico = async () => {
  const { data, error } = await supabase
    .from("plantas")
    .select(
      "id, nombres_planta: nombres, paises_nombre, nombre_cientifico, foto_perfil, foto_referencial",
    )
    .order("nombres", { ascending: true });

  if (error) throw error;
  return data;
};

// 3. Obtener logs para Actividades o Gestión
export const getLogs = async (panelType) => {
  const query = supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (panelType === "actividades") {
    const fecha30 = new Date();
    fecha30.setDate(fecha30.getDate() - 30);
    return await query
      .or(`tipo_accion.eq.nueva_planta,tipo_accion.eq.nueva_ubicacion`)
      .gte("created_at", fecha30.toISOString());
  }

  if (panelType === "gestion") {
    const fecha7 = new Date();
    fecha7.setDate(fecha7.getDate() - 7);
    return await query
      .in("tipo_accion", ["nueva_imagen", "nuevo_nombre"])
      .or(
        `revisado.eq.false,and(revisado.eq.true,created_at.gte.${fecha7.toISOString()})`,
      );
  }
};

/**
 * REGISTROS INICIALES (POST)
 */

// 4. Crear nueva especie (Nace con veredicto null para tu revisión)
export const crearEspecieNueva = async (
  nombre,
  fotoUrl,
  usuarioId,
  alias,
  pais,
  grupoId,
) => {
  const { data: nueva, error } = await supabase
    .from("plantas")
    .insert([
      {
        nombres: [nombre],
        paises_nombre: [pais || "world"],
        foto_referencial: fotoUrl,
        creador_planta: usuarioId,
      },
    ])
    .select("id")
    .single();

  if (error) throw error;

  await supabase.from("logs").insert([
    {
      planta_id: nueva.id,
      nombre_planta: nombre,
      usuario_id: usuarioId,
      alias,
      grupo_id: grupoId,
      tipo_accion: "nueva_planta",
      contenido: fotoUrl,
      revisado: false,
      veredicto: null,
    },
  ]);
  return nueva;
};

// 5. Agregar ubicación (Auto-revisado con Check Azul)
export const agregarUbicacion = async (
  plantaId,
  usuarioId,
  coords,
  fotoUrl,
  datos,
  nombrePlanta,
  alias,
  grupoId,
) => {
  console.log(datos)
  // 1. Registro en Ubicaciones
  const { data, error } = await supabase
    .from("ubicaciones")
    .insert([
      {
        planta_id: plantaId,
        usuario_id: usuarioId,
        foto_contexto: fotoUrl,
        latitud: coords.lat,
        longitud: coords.lng,
        ciudad: datos?.ciudad || null,
        distrito: datos?.distrito || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // 2. Registro en Logs
  // Usamos toISOString() para que Supabase lo reciba como un timestamp válido
  const ahora = new Date().toISOString();

  const { error: errorLog } = await supabase.from("logs").insert([
    {
      planta_id: plantaId,
      nombre_planta: nombrePlanta,
      usuario_id: usuarioId,
      alias: alias,
      grupo_id: grupoId,
      tipo_accion: "nueva_ubicacion",
      contenido: fotoUrl,
      ciudad: datos?.ciudad || null,
      distrito: datos?.distrito || null,
      revisado: true,
      veredicto: "revisado",
      veredicto_por: alias,
      revisado_por: alias,
      // Enviamos la fecha a ambos campos para evitar fallos de visualización
      fecha_revision: ahora,
      fecha_veredicto: ahora,
      created_at: ahora,
    },
  ]);

  if (errorLog) {
    console.error("Fallo al guardar fecha_revision en Logs:", errorLog.message);
  }

  return data;
};

// 6. Registrar propuesta de imagen (Nace esperando filtro operativo)
export const registrarPropuestaImagen = async (
  plantaId,
  usuarioId,
  url,
  etiqueta,
  nombrePlanta,
  alias,
  grupoId,
) => {
  return await supabase.from("logs").insert([
    {
      planta_id: parseInt(plantaId),
      usuario_id: usuarioId,
      nombre_planta: nombrePlanta,
      alias,
      grupo_id: grupoId,
      tipo_accion: "nueva_imagen",
      contenido: `${etiqueta}|${url}`,
      revisado: false,
      veredicto: null,
    },
  ]);
};

/**
 * EL CORAZÓN DEL SISTEMA (LOGIC)
 */

// 7. Procesa Aprobación Operativa (Nivel 1) y Veredicto Admin (Nivel 2)
export const processProposal = async (log, tipoAccion, admin) => {
  try {
    // --- NIVEL 1: FILTRO OPERATIVO (Aprobar/Publicar) ---
    if (tipoAccion === "filtro_operativo_aprobar") {
      // CASO A: Aprobación de Imagen Técnica (Hoja, Tallo, Perfil, etc.)
      if (log.tipo_accion === "nueva_imagen") {
        // 1. Extraemos etiqueta (ej: "hoja") y la URL del log
        const [etiqueta, url] = log.contenido.split("|");
        const nombreColumna = `foto_${etiqueta}`; // Ejemplo: foto_hoja

        // 2. Traemos el array actual de esa columna específica
        const { data: p, error: errorFetch } = await supabase
          .from("plantas")
          .select(nombreColumna)
          .eq("id", log.planta_id)
          .single();

        if (errorFetch) throw errorFetch;

        // 3. Sumamos la nueva URL al array (manejando si es nulo o string viejo)
        const valorActual = p[nombreColumna];
        const arrayActualizado = Array.isArray(valorActual)
          ? [...valorActual, url]
          : valorActual
            ? [valorActual, url] // Si era un string, lo convertimos a array con el nuevo dato
            : [url]; // Si era null, empezamos el array

        // 4. Actualizamos la tabla 'plantas'
        const { error: errorUpdate } = await supabase
          .from("plantas")
          .update({ [nombreColumna]: arrayActualizado })
          .eq("id", log.planta_id);

        if (errorUpdate) throw errorUpdate;
      }

      // CASO B: Aprobación de Nuevo Nombre Común
      if (log.tipo_accion === "nuevo_nombre") {
        const { data: p } = await supabase
          .from("plantas")
          .select("nombres, paises_nombre")
          .eq("id", log.planta_id)
          .single();

        const listaNombres = [...(p.nombres || []), log.contenido];
        const listaPaises = [...(p.paises_nombre || []), log.pais_codigo];

        await supabase
          .from("plantas")
          .update({ nombres: listaNombres, paises_nombre: listaPaises })
          .eq("id", log.planta_id);
      }

      // FINALIZACIÓN: Actualizamos el LOG con quién aprobó y cuándo
      await supabase
        .from("logs")
        .update({
          revisado: true,
          revisado_por: admin.alias, // Guardamos tu alias "Ika Kana" como TEXT
          fecha_revision: new Date().toISOString(),
          veredicto: "revisado", // Marcamos como aceptado operativamente
        })
        .eq("id", log.id);
    }

    // --- NIVEL 2: RECHAZO OPERATIVO ---
    if (tipoAccion === "filtro_operativo_rechazar") {
      await supabase
        .from("logs")
        .update({
          revisado: true,
          veredicto: "rechazado",
          revisado_por: admin.alias,
          fecha_revision: new Date().toISOString(),
        })
        .eq("id", log.id);
    }

    // --- NIVEL 3: TU SELLO DE CALIDAD (Admin Maestro) ---
    if (tipoAccion === "veredicto_final_admin") {
      await supabase
        .from("logs")
        .update({
          veredicto: "revisado",
          veredicto_por: admin.alias,
          fecha_veredicto: new Date().toISOString(),
        })
        .eq("id", log.id);
    }

    return { success: true };
  } catch (error) {
    console.error("Error crítico en processProposal:", error.message);
    return { success: false, error: error.message };
  }
};

export const eliminarUbicacionConFoto = async (idUbi, urlFoto) => {
  try {
    // 1. Extraer el Public ID de Cloudinary desde la URL
    // Ejemplo: .../upload/v1234/folder/foto.jpg -> folder/foto
    const partes = urlFoto.split("/upload/");
    if (partes.length < 2) throw new Error("URL de foto inválida");

    const rutaPostUpload = partes[1].split("/");
    const rutaSinVersion = rutaPostUpload.slice(1).join("/");
    const publicIdCodificado = rutaSinVersion.split(".")[0];
    const publicIdLimpio = decodeURIComponent(publicIdCodificado);

    // 2. Llamar a tu Edge Function de Supabase para borrar de Cloudinary y de la tabla Ubicaciones
    const { error } = await supabase.functions.invoke(
      "eliminar-ubicacion-completa",
      {
        body: {
          ubiId: idUbi,
          publicId: publicIdLimpio,
        },
      },
    );

    if (error) throw error;
    return true; // Éxito
  } catch (error) {
    console.error("Error en eliminarUbicacionConFoto:", error.message);
    return false; // Fallo
  }
};

export const agregarDetalleStaff = async (
  plantaId,
  nuevoNombre,
  paisCodigo,
  user,
) => {
  // Solo crea el LOG. No toca la tabla 'plantas'.
  const { error } = await supabase.from("logs").insert([
    {
      planta_id: plantaId,
      usuario_id: user.id,
      alias: user.alias,
      grupo_id: user.grupo_id,
      tipo_accion: "nuevo_nombre", // Esto activa la lógica en processProposal
      contenido: nuevoNombre,
      pais_codigo: paisCodigo,
      revisado: false,
      veredicto: null,
    },
  ]);

  if (error) throw error;
  return { id: plantaId }; // Retorno mínimo para que el Registro no de error
};