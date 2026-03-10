import { supabase } from "../supabaseClient";

export const logService = {
  /**
   * 1. LECTURA (Bandeja de entrada y Historial)
   * Maneja tanto la campana de actividades como el panel de gestión de staff.
   */
  getLogs: async (tipoPanel, user) => {
    if (!user || !tipoPanel) return [];

    const acciones =
      tipoPanel === "actividades"
        ? ["nueva_planta", "nueva_ubicacion"]
        : ["nueva_imagen", "nuevo_nombre", "nuevo_comentario"];

    // Solo pedimos el JOIN de aportes si estamos en gestión para ver el contenido (fotos/texto)
    const selector = tipoPanel === "gestion" ? "*, aportes(*)" : "*";

    let query = supabase
      .from("logs")
      .select(selector)
      .in("tipo_accion", acciones)
      .order("created_at", { ascending: false });

    // Filtros de Seguridad: El Staff ve todo lo de su grupo, el usuario solo lo suyo.
    if (tipoPanel === "gestion") {
      const esStaff =
        user.rol === "Administrador" || user.rol === "Colaborador";
      if (!esStaff) {
        query = query.eq("usuario_id", user.id);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error obteniendo logs:", error);
      throw error;
    }
    return data || [];
  },

  /**
   * 2. CREACIÓN DE APORTES
   * Registra el Log (historial) y el Aporte (detalle técnico) de forma atómica.
   */
  enviarAporte: async ({
    plantaId,
    nombrePlanta,
    usuarioId,
    alias,
    grupoId,
    nombre_grupo,
    tipoAccion,
    contenidoJSON,
  }) => {
    // PASO 1: Crear el Log con sanitización para evitar NULLs
    const { data: logData, error: logError } = await supabase
      .from("logs")
      .insert([
        {
          planta_id: plantaId,
          nombre_planta: nombrePlanta,
          usuario_id: usuarioId,
          alias: alias,
          grupo_id: grupoId || "Sin grupo",
          nombre_grupo: nombre_grupo || "Sin grupo",
          contenido: contenidoJSON,
          auditado: "pendiente",
          revisado: "pendiente",
          latitud: 0,
          longitud: 0,
          ciudad: "No aplica",
          distrito: "No aplica",
          tipo_accion: tipoAccion,
          mensaje_staff: { revisado: null, auditado: null },
        },
      ])
      .select("id")
      .single();

    if (logError) throw logError;

    // PASO 2: Guardar en tabla 'aportes' para mantener la integridad
    const { error: aporteError } = await supabase.from("aportes").insert([
      {
        log_id: logData.id,
        planta_id: plantaId,
        contenido: contenidoJSON,
      },
    ]);

    if (aporteError) throw aporteError;

    return logData.id;
  },

  /**
   * 3. RESOLUCIÓN (Aprobar / Rechazar / Auditar)
   * Permite que el Admin confirme o se retracte de decisiones previas.
   */
  resolverAporte: async ({
    logId,
    plantaId,
    accion, // 'aprobar', 'rechazar', 'auditar_aprobar', 'auditar_rechazar'
    tipoAporte,
    contenidoJSON,
    revisorAlias,
    comentario,
  }) => {
    const ahora = new Date().toISOString();

    // 1. Desglosar Acción y Etapa
    const esAuditoria = accion.startsWith("auditar_");
    const decision = accion.includes("aprobar") ? "aprobado" : "rechazado";

    // 2. Traer el estado previo de la tabla LOGS para saber si es ratificación o reversión
    const { data: logActual } = await supabase
      .from("logs")
      .select("revisado, mensaje_staff")
      .eq("id", logId)
      .single();

    const estadoPrevioRevisado = logActual?.revisado || "pendiente";

    let nuevosMensajes =
      logActual?.mensaje_staff && typeof logActual.mensaje_staff === "object"
        ? { ...logActual.mensaje_staff }
        : { revisado: null, auditado: null };

    // 3. Preparar datos para la tabla LOGS
    const updates = {};
    if (esAuditoria) {
      // ETAPA 2: ADMINISTRADOR
      updates.auditado = decision;
      updates.auditado_por = revisorAlias;
      updates.fecha_auditado = ahora;
      nuevosMensajes.auditado =
        comentario ||
        (decision === "aprobado"
          ? "Aporte auditado."
          : "Aporte observado.");
    } else {
      // ETAPA 1: COLABORADOR
      updates.revisado = decision;
      updates.revisado_por = revisorAlias;
      updates.fecha_revision = ahora;
      nuevosMensajes.revisado =
        comentario ||
        (decision === "aprobado" ? "Aporte verificado." : "Aporte observado.");
    }
    updates.mensaje_staff = nuevosMensajes;

    // 4. Actualizar tabla LOGS
    const { error: logError } = await supabase
      .from("logs")
      .update(updates)
      .eq("id", logId);
    if (logError) throw logError;

    // 5. 🟢 LÓGICA DE NEGOCIO WEB (CARRUSEL, APORTES, CLOUDINARY)
    if (tipoAporte === "nueva_imagen" || tipoAporte === "nuevo_nombre") {
      let accionWeb = "ninguna";
      let eliminarDeCloudinary = false;

      if (!esAuditoria) {
        // --- REGLAS COLABORADOR ---
        if (decision === "aprobado") accionWeb = "subir";
      } else {
        // --- REGLAS ADMINISTRADOR ---
        if (decision === "aprobado" && estadoPrevioRevisado === "rechazado")
          accionWeb = "subir";
        if (decision === "rechazado" && estadoPrevioRevisado === "aprobado")
          accionWeb = "bajar";

        // REGLA MAESTRA: Si el Admin rechaza, se destruye todo rastro de la imagen.
        if (decision === "rechazado" && tipoAporte === "nueva_imagen") {
          eliminarDeCloudinary = true;
        }
      }

      if (tipoAporte === "nueva_imagen") {
        const { url, categoria } = contenidoJSON;

        // A) GESTIONAR CARRUSEL DE PLANTAS (Inyectar o Quitar)
        if (accionWeb !== "ninguna" && url) {
          const columnaFoto = `foto_${categoria.toLowerCase()}`;
          const { data: planta } = await supabase
            .from("plantas")
            .select(columnaFoto)
            .eq("id", plantaId)
            .single();
          let fotosActuales = planta?.[columnaFoto] || [];

          if (accionWeb === "subir" && !fotosActuales.includes(url)) {
            fotosActuales.push(url);
            await supabase
              .from("plantas")
              .update({ [columnaFoto]: fotosActuales })
              .eq("id", plantaId);
          } else if (accionWeb === "bajar") {
            fotosActuales = fotosActuales.filter((f) => f !== url);
            await supabase
              .from("plantas")
              .update({ [columnaFoto]: fotosActuales })
              .eq("id", plantaId);
          }
        }

        // B) DESTRUCCIÓN FINAL Y LIMPIEZA
        if (eliminarDeCloudinary && url) {
          console.log(
            `⚠️ Destrucción Final: Limpiando BD y Cloudinary para -> ${url}`,
          );

          // B1. Quitar URL de la tabla LOGS (Para que la tarjeta diga "Sin Imagen")
          const contenidoSinFoto = { ...contenidoJSON, url: "" };
          await supabase
            .from("logs")
            .update({ contenido: contenidoSinFoto })
            .eq("id", logId);

          // B2. 🟢 Eliminar la fila basura de la tabla APORTES usando log_id
          const { error: errorAporteDelete } = await supabase
            .from("aportes")
            .delete()
            .eq("log_id", logId);
          if (errorAporteDelete)
            console.error(
              "❌ Error al borrar de tabla aportes:",
              errorAporteDelete.message,
            );

          // B3. Destruir en Cloudinary
          try {
            const partes = url.split("/upload/");
            if (partes.length >= 2) {
              const publicId = decodeURIComponent(
                partes[1].split("/").slice(1).join("/").split(".")[0],
              );

              await supabase.functions.invoke("eliminar-ubicacion-completa", {
                body: { ubiId: null, publicId: publicId },
              });
            }
          } catch (errorCloudinary) {
            console.error(
              "❌ Error al intentar borrar en Cloudinary:",
              errorCloudinary.message,
            );
          }
        } else {
          // C) 🟢 SINCRONIZAR ESTADO EN LA TABLA APORTES (Si el ticket no fue destruido)
          const updateAportes = {};
          if (esAuditoria) {
            updateAportes.auditado = decision; // Escribe "aprobado"
          } else {
            updateAportes.revisado = decision; // Escribe "aprobado" o "rechazado"
          }

          const { error: errorSync } = await supabase
            .from("aportes")
            .update(updateAportes)
            .eq("log_id", logId);

          if (errorSync)
            console.error(
              "❌ Error sincronizando estado en la tabla aportes:",
              errorSync.message,
            );
        }
      }

      // D) GESTIONAR TEXTOS (Ej. Nombres)
      if (tipoAporte === "nuevo_nombre" && accionWeb !== "ninguna") {
        // Tu lógica para actualizar textos
      }
    }

    return { success: true };
  },
};
