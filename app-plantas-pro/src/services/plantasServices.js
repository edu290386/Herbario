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
      .in("tipo_accion", [
        "nueva_imagen",
        "nuevo_nombre",
        "imagen_rechazada",
        "imagen_aprobada",
      ])
      .or(
        `revisado.eq.pendiente,revisado.is.null,and(revisado.neq.pendiente,created_at.gte.${fecha7.toISOString()})`,
      );
  }
};

/**
 * REGISTROS INICIALES (POST)
 */

// 4. Crear nueva especie
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
      auditado: null,
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
  console.log(datos);
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
      auditado: "revisado",
      auditado_por: alias,
      revisado_por: alias,
      // Enviamos la fecha a ambos campos para evitar fallos de visualización
      fecha_revision: ahora,
      fecha_auditado: ahora,
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
  // console.log("Enviando log con:", { plantaId, usuarioId, alias }); // Debug opcional

  const { data, error } = await supabase.from("logs").insert([
    {
      planta_id: parseInt(plantaId),
      usuario_id: usuarioId,
      nombre_planta: nombrePlanta,
      alias: alias,
      grupo_id: grupoId,
      tipo_accion: "nueva_imagen",
      contenido: `${etiqueta}|${url}`,
      revisado: "pendiente",
      auditado: "pendiente",
      // IMPORTANTE: Asegúrate de que NO existan columnas viejas como 'veredicto'
    },
  ]);

  if (error) {
    console.error("🚨 Error real de Supabase:", error.message);
    console.error("Detalles:", error.details);
  }

  return { data, error };
};

/**
 * EL CORAZÓN DEL SISTEMA (LOGIC)
 */

// Mantengo tu función original por si la usas en otros componentes
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
      revisado: "pendiente",
      auditado: "pendiente",
    },
  ]);

  if (error) throw error;
  return { id: plantaId }; // Retorno mínimo para que el Registro no de error
};

export const processProposal = async (proposal, comando, revisorAlias) => {
  try {
    const { id: logId, contenido } = proposal;

    // 1. Identificamos la acción según el comando del botón
    const esAprobar = comando === "filtro_operativo_aprobar";
    const esRechazar = comando === "filtro_operativo_rechazar";
    const esAuditoriaAdmin = comando === "auditado_final_admin";

    console.log(`🛠️ Procesando Comando: ${comando} | Por: ${revisorAlias}`);

    // 2. Objeto base de actualización (Campos comunes)
    let updateData = {
      revisado_por: revisorAlias,
      fecha_revision: new Date().toISOString(),
    };

    // --- LÓGICA DE FILTRO OPERATIVO ---

    // CASO 1: APROBAR
    if (esAprobar) {
      updateData.revisado = "aprobado";
      updateData.tipo_accion = "imagen_aprobada"; // Nuevo estado para trazabilidad
    }

    // CASO 2: RECHAZAR (Con limpieza física y lógica)
    if (esRechazar) {
      updateData.revisado = "rechazado";
      updateData.tipo_accion = "imagen_rechazada";

      // Limpieza de contenido: mantenemos la categoría pero quitamos la URL
      const partes = contenido.split("|");
      const categoria = partes[0].trim();
      updateData.contenido = `${categoria}| Archivo eliminado`;

      // Borrado físico en Cloudinary si existe URL
      if (contenido.includes("http")) {
        const urlFoto = partes[1]?.trim();
        if (urlFoto) {
          console.log("🗑️ Iniciando borrado físico en Cloudinary...");
          await ejecutarEliminarImagenLog(urlFoto);
        }
      }
    }

    // --- LÓGICA DE AUDITORÍA ADMIN ---

    // CASO 3: AUDITORÍA (Clic en el Warning)
    if (esAuditoriaAdmin) {
      updateData.auditado = "revisado"; // De 'pendiente' a 'revisado'
    }

    // 3. Ejecución de la actualización en Supabase
    const { data, error } = await supabase
      .from("logs")
      .update(updateData)
      .eq("id", logId)
      .select();

    if (error) throw error;

    console.log("✅ Registro actualizado en DB:", data[0]);
    return { success: true, data: data[0] };
  } catch (err) {
    console.error("🚨 Error en processProposal:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Función auxiliar para el borrado físico en Cloudinary
 * (Asegúrate de tenerla exportada o definida en el mismo archivo)
 */
export const ejecutarEliminarImagenLog = async (urlFoto) => {
  try {
    const partes = urlFoto.split("/upload/");
    if (partes.length < 2) return;

    const rutaConVersion = partes[1].split("/");
    const publicId = decodeURIComponent(
      rutaConVersion.slice(1).join("/").split(".")[0],
    );

    const { data, error } = await supabase.functions.invoke(
      "eliminar-imagen-log",
      {
        body: { publicId },
      },
    );

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("⚠️ Error en Cloudinary:", err.message);
    return null;
  }
};