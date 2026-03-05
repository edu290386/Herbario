import { supabase } from "./../supabaseClient";

/**
 * ==========================================
 * 1. CREACIÓN DE APORTES (El flujo de 2 pasos)
 * ==========================================
 */
export const enviarAporte = async ({
  plantaId,
  nombrePlanta,
  usuarioId,
  alias,
  grupoId,
  tipoAccion, // Ej: "nueva_imagen", "nuevo_nombre", "nuevo_aporte" (texto)
  contenidoJSON, // Ej: { url: "...", categoria: "flor" }
}) => {
  // PASO 1: Crear el Log (El recibo para el usuario)
  const { data: logData, error: logError } = await supabase
    .from("logs")
    .insert([
      {
        planta_id: plantaId,
        nombre_planta: nombrePlanta,
        usuario_id: usuarioId,
        alias: alias,
        grupo_id: grupoId,
        tipo_accion: tipoAccion,
        revisado: "pendiente",
      },
    ])
    .select("id")
    .single();

  if (logError) throw logError;

  // PASO 2: Guardar el "peso" en la Sala de Espera (aportes)
  const { data: aporteData, error: aporteError } = await supabase
    .from("aportes")
    .insert([
      {
        log_id: logData.id,
        planta_id: plantaId,
        contenido: contenidoJSON,
      },
    ])
    .select()
    .single();

  if (aporteError) {
    // Si falla el aporte, idealmente borraríamos el log, pero por ahora lanzamos el error
    console.error("Error guardando el JSON del aporte:", aporteError);
    throw aporteError;
  }

  return { logId: logData.id, aporte: aporteData };
};

/**
 * ==========================================
 * 2. LECTURA DE BANDEJAS (El JOIN mágico)
 * ==========================================
 */
export const obtenerBandejaAportes = async (user, vista) => {
  if (!user) return { data: [], error: "Usuario no autenticado" };

  // Hacemos un JOIN directo: Trae el log Y su cajita de datos de la tabla aportes
  let query = supabase
    .from("logs")
    .select(
      `
      *,
      aportes (*) 
    `,
    )
    .in("tipo_accion", ["nueva_imagen", "nuevo_nombre", "nuevo_aporte"])
    .order("created_at", { ascending: false });

  // Si es la vista del Staff (solo ven lo de su grupo que esté pendiente)
  if (vista === "staff") {
    if (!user.grupo_id) return { data: [], error: "Staff sin grupo" };
    query = query.eq("grupo_id", user.grupo_id).eq("revisado", "pendiente");
  }
  // Si es la vista del Usuario (ven todo su historial de envíos)
  else if (vista === "usuario") {
    query = query.eq("usuario_id", user.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  return { data, error: null };
};

/**
 * ==========================================
 * 3. APROBACIÓN / RECHAZO (La magia del Staff)
 * ==========================================
 */
export const resolverAporte = async ({
  logId,
  plantaId,
  accion,
  tipoAporte,
  contenidoJSON,
  revisorAlias,
}) => {
  const esAprobar = accion === "aprobar";
  const ahora = new Date().toISOString();

  // 1. ACTUALIZAR EL LOG (Para las estadísticas)
  const { error: logError } = await supabase
    .from("logs")
    .update({
      revisado: esAprobar ? "aprobado" : "rechazado",
      revisado_por: revisorAlias,
      fecha_revision: ahora,
    })
    .eq("id", logId);

  if (logError) throw logError;

  // 2. SI SE RECHAZA, terminamos aquí. (Opcional: llamar función para borrar de Cloudinary si es foto).
  if (!esAprobar) return { success: true, mensaje: "Aporte rechazado" };

  // 3. SI SE APRUEBA: Inyectar datos en la tabla 'plantas'
  if (esAprobar) {
    // CASO A: Es una nueva imagen
    if (tipoAporte === "nueva_imagen") {
      const { url, categoria } = contenidoJSON;
      const columnaFoto = `foto_${categoria.toLowerCase()}`; // ej: foto_flor

      // Traemos las fotos actuales
      const { data: plantaActual } = await supabase
        .from("plantas")
        .select(columnaFoto)
        .eq("id", plantaId)
        .single();

      const fotosActuales = plantaActual[columnaFoto] || [];
      const nuevoArrayFotos = [...fotosActuales, url];

      // Hacemos el Push a la planta
      const { error: updateError } = await supabase
        .from("plantas")
        .update({ [columnaFoto]: nuevoArrayFotos })
        .eq("id", plantaId);

      if (updateError) throw updateError;
    }

    // CASO B: Es un nuevo nombre (Próximamente agregaremos la lógica del JSON aquí)
    if (tipoAporte === "nuevo_nombre") {
      // Aquí irá la lógica para hacer el push al JSONB de nombres_internacionales
      console.log("Aprobando nombre:", contenidoJSON);
    }
  }

  return {
    success: true,
    mensaje: "Aporte aprobado e integrado a la enciclopedia",
  };
};
