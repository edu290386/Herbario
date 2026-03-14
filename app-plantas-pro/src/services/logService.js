import { supabase } from "../supabaseClient";

export const logService = {
  /**
   * 1. LECTURA DE LOGS
   */
  getLogs: async (tipoPanel, user) => {
    if (!user || !tipoPanel) return [];

    const acciones =
      tipoPanel === "actividades"
        ? ["nueva_planta", "nueva_ubicacion"]
        : ["nueva_imagen", "nuevo_nombre", "nuevo_comentario"];

    const selector = tipoPanel === "gestion" ? "*, aportes(*)" : "*";

    let query = supabase
      .from("logs")
      .select(selector)
      .in("tipo_accion", acciones)
      .order("created_at", { ascending: false });

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
   */
  enviarAporte: async ({
    plantaId,
    nombrePlanta,
    usuarioId,
    alias,
    grupoId,
    grupo,
    tipoAccion,
    contenidoJSON,
    estadoRevisado = "pendiente", // 🟢 Por defecto es pendiente (Imagen/Nombre)
    mensajeRevisado = null, // 🟢 Por defecto es nulo
  }) => {
    const ahora = new Date().toISOString();
    const esAutoAprobado = estadoRevisado === "aprobado";
    
    const { data: logData, error: logError } = await supabase
      .from("logs")
      .insert([
        {
          planta_id: plantaId,
          nombre_planta: nombrePlanta,
          usuario_id: usuarioId,
          alias: alias,
          grupo_id: grupoId || "Sin grupo",
          nombre_grupo: grupo || "Sin grupo",
          contenido: contenidoJSON,
          auditado: "pendiente",
          revisado: estadoRevisado,
          revisado_por: esAutoAprobado ? alias : null,
          fecha_revision: esAutoAprobado ? ahora : null,
          latitud: null,
          longitud: null,
          ciudad: "No aplica",
          distrito: "No aplica",
          tipo_accion: tipoAccion,
          mensaje_staff: { revisado: mensajeRevisado, auditado: null },
        },
      ])
      .select("id")
      .single();

    if (logError) throw logError;

    const { error: aporteError } = await supabase.from("aportes").insert([
      {
        log_id: logData.id,
        planta_id: plantaId,
        nombre_planta: nombrePlanta,
        contenido: contenidoJSON,
        revisado: estadoRevisado, // Sincronizado
        auditado: "pendiente",
      },
    ]);

    if (aporteError) throw aporteError;

    return logData.id;
  },

  /**
   * 3. RESOLUCIÓN DE APORTES (Simetría: verificar_ / auditar_)
   */
  resolverAporte: async ({
    logId,
    plantaId,
    accion,
    tipoAporte,
    contenidoJSON,
    revisorAlias,
    comentario,
  }) => {
    try {
      const ahora = new Date().toISOString();

      // --- FASE 1: DEFINIR ACCIÓN ---
      const esBaneo = accion === "banear";
      const esVerificacion = accion.startsWith("verificar_");
      const esAuditoria = accion.startsWith("auditar_") || esBaneo;

      let estadoFinal = accion.includes("aprobar") ? "aprobado" : "rechazado";
      if (esBaneo) estadoFinal = "baneado";

      const { data: logActual } = await supabase.from("logs").select("*").eq("id", logId).single();
      if (!logActual) throw new Error("Log no encontrado");

      const nombrePlanta = logActual.nombre_planta || "Planta";
      const estadoPrevioRevisado = logActual.revisado || "pendiente";

      let mensajesStaff = {};
      try {
        const raw = logActual.mensaje_staff;
        if (raw) mensajesStaff = typeof raw === "string" ? JSON.parse(raw) : { ...raw };
      } catch (e) { mensajesStaff = {e}; }

      // --- FASE 2: ACTUALIZACIÓN DEL HISTORIAL (LOGS) ---
      const updatesLogs = { mensaje_staff: mensajesStaff };

      if (esAuditoria) {
        updatesLogs.auditado = estadoFinal;
        updatesLogs.auditado_por = revisorAlias;
        updatesLogs.fecha_auditado = ahora;
        mensajesStaff.auditado = comentario || (esBaneo ? "Falta grave archivada." : "Aporte auditado.");
      } else if (esVerificacion) {
        updatesLogs.revisado = estadoFinal;
        updatesLogs.revisado_por = revisorAlias;
        updatesLogs.fecha_revision = ahora;
        updatesLogs.auditado = "pendiente";
        mensajesStaff.revisado = comentario || (estadoFinal === "aprobado" ? "Aporte verificado." : "Aporte observado.");
      }

      await supabase.from("logs").update(updatesLogs).eq("id", logId);

      // --- FASE 3: IMPACTO WEB (SUBIR / BAJAR) ---
      let accionWeb = "ninguna";
      if (esVerificacion) {
        if (estadoFinal === "aprobado") accionWeb = "subir";
      } else if (esAuditoria) {
        // Subir si el admin aprueba algo que el colaborador rechazó
        if (estadoFinal === "aprobado" && estadoPrevioRevisado === "rechazado") accionWeb = "subir";
        // Bajar si el admin rechaza/banea algo que el colaborador ya había aprobado
        if ((estadoFinal === "rechazado" || esBaneo) && estadoPrevioRevisado === "aprobado") accionWeb = "bajar";
      }

      // --- FASE 4: LIMPIEZA DE BANDEJA (APORTES) ---
      const esRechazoDefinitivo = esAuditoria && estadoFinal === "rechazado";

      if (esRechazoDefinitivo || esBaneo) {
        await supabase.from("aportes").delete().eq("log_id", logId);
      } else {
        const updateAportes = {
          nombre_planta: nombrePlanta,
          ...(esAuditoria ? { auditado: estadoFinal } : { revisado: estadoFinal }),
        };
        await supabase.from("aportes").update(updateAportes).eq("log_id", logId);
      }

      // --- FASE 5: ACCIONES ESPECÍFICAS (IMAGEN/NOMBRE) ---
      if (tipoAporte === "nueva_imagen") {
        const { url, categoria } = contenidoJSON;
        const col = `foto_${categoria.toLowerCase()}`;

        // A. Actualizar tabla plantas (Carrusel)
        if (accionWeb !== "ninguna" && url) {
          const { data: p } = await supabase.from("plantas").select(col).eq("id", plantaId).single();
          let fotos = p?.[col] || [];
          if (accionWeb === "subir" && !fotos.includes(url)) fotos.push(url);
          else if (accionWeb === "bajar") fotos = fotos.filter(f => f !== url);
          await supabase.from("plantas").update({ [col]: fotos }).eq("id", plantaId);
        }

        // B. 🟢 BORRADO FÍSICO DE CLOUDINARY (Corregido)
        // Se ejecuta si es un rechazo final de auditoría (no baneo para dejar evidencia)
        if (esRechazoDefinitivo && url) {
          try {
            const partes = url.split("/upload/");
            if (partes.length >= 2) {
              const pathCompleto = partes[1].split("/");
              
              // 🟢 MEJORA: Solo quitamos el primer segmento si es la versión (ej: v1654321)
              if (pathCompleto[0].startsWith('v') && !isNaN(pathCompleto[0].substring(1))) {
                pathCompleto.shift();
              }
              
              // El publicId es el path sin la extensión (.jpg, .png, etc.)
              const publicId = decodeURIComponent(pathCompleto.join("/").split(".")[0]);
              
              console.log("Intentando eliminar PublicID:", publicId);

              await supabase.functions.invoke("eliminar-ubicacion-completa", {
                body: { ubiId: null, publicId: publicId },
              });
            }
          } catch (e) {
            console.error("Error al intentar borrar de Cloudinary:", e.message);
          }
        }
      }

      // --- GESTIÓN DE NOMBRES (Limpia) ---
      if (tipoAporte === "nuevo_nombre" && accionWeb !== "ninguna") {
        const { nombre_sugerido, procedencia } = contenidoJSON;
        const nombreAjustado = nombre_sugerido.trim();
        const paisUpper = (procedencia || "WORLD").toUpperCase();
        const { data: p } = await supabase.from("plantas").select("nombres_internacionales, nombres, paises_nombre").eq("id", plantaId).single();
        
        let jsonN = p?.nombres_internacionales || [];
        let arrayS = p?.nombres || [];
        let pIdx = jsonN.findIndex(b => b.pais === paisUpper);

        if (accionWeb === "subir") {
          const item = { texto: nombreAjustado, verificado: true, rechazado: false };
          if (pIdx >= 0) {
            if (!jsonN[pIdx].nombres.find(n => n.texto.toLowerCase() === nombreAjustado.toLowerCase())) jsonN[pIdx].nombres.push(item);
          } else {
            jsonN.push({ pais: paisUpper, nombres: [item] });
          }
          if (!arrayS.includes(nombreAjustado)) arrayS.push(nombreAjustado);
        } else if (accionWeb === "bajar") {
          if (pIdx >= 0) {
            jsonN[pIdx].nombres = jsonN[pIdx].nombres.filter(n => n.texto.toLowerCase() !== nombreAjustado.toLowerCase());
            if (jsonN[pIdx].nombres.length === 0) jsonN.splice(pIdx, 1);
          }
          arrayS = [...new Set(jsonN.flatMap(b => b.nombres.map(n => n.texto)))];
        }

        await supabase.from("plantas").update({ 
          nombres_internacionales: jsonN, 
          nombres: arrayS, 
          paises_nombre: [...new Set(jsonN.map(b => b.pais))] 
        }).eq("id", plantaId);
      }

      return { success: true };
    } catch (error) {
      console.error("🔥 Error en resolverAporte:", error);
      return { success: false, error: error.message };
    }
  },
}
