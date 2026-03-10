import { supabase } from "../supabaseClient";
import { normalizarParaBusqueda, formatearParaDB } from "../helpers/textHelper";

/**
 * ==========================================
 * 1. FUNCIONES DE VALIDACIÓN Y BUSQUEDA
 * ==========================================
 */

export const checkNombreExistente = async (nombreUsuario) => {
  if (!nombreUsuario) return false;
  const { data: todasLasPlantas, error } = await supabase
    .from("plantas")
    .select("nombres");
  if (error) throw error;

  const nombreLimpioUsuario = normalizarParaBusqueda(nombreUsuario);
  return todasLasPlantas.some((planta) =>
    planta.nombres?.some(
      (n) => normalizarParaBusqueda(n) === nombreLimpioUsuario,
    ),
  );
};

export const getPlantasBasico = async () => {
  const { data, error } = await supabase
    .from("plantas")
    .select("id, nombres_planta: nombres, nombre_cientifico, foto_perfil")
    .order("nombres", { ascending: true });
  if (error) throw error;
  return data;
};

/**
 * ==========================================
 * 2. SERVICIOS DE PLANTA (NUEVA ESTRUCTURA)
 * ==========================================
 */

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

export const crearEspecieNueva = async (
  nombre,
  fotoUrl,
  usuarioId,
  alias,
  pais,
  grupoId, // Este dato es vital para el log
  nombresArray,
  nombresInternacionalesJSON,
) => {
  const nombreEstetico = formatearParaDB(nombre);

  // 1. Inserción en la tabla 'plantas'
  // IMPORTANTE: Asegúrate de que 'plantas' NO reciba grupo_id si no existe la columna
  const { data: nueva, error } = await supabase
    .from("plantas")
    .insert([
      {
        nombres: nombresArray || [nombreEstetico],
        paises_nombre: [pais || "world"],
        foto_referencial: fotoUrl,
        creador_planta: usuarioId,
        nombres_internacionales: nombresInternacionalesJSON || [],
        // NO agregues grupo_id aquí si la tabla 'plantas' no lo tiene
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Error al crear planta:", error);
    throw error;
  }

  // 2. Inserción en la tabla 'logs'
  // Aquí es donde grupoId suele ser necesario para el control de aportes
  const { error: errorLog } = await supabase.from("logs").insert([
    {
      planta_id: nueva.id,
      nombre_planta: nombreEstetico,
      usuario_id: usuarioId,
      alias: alias,
      grupo_id: grupoId, // Aquí sí va, según tu esquema de logs
      tipo_accion: "nueva_planta",
      contenido: fotoUrl,
      revisado: "pendiente",
    },
  ]);

  if (errorLog) {
    console.warn("Planta creada, pero falló el log:", errorLog.message);
    // No lanzamos throw aquí para no interrumpir el flujo si la planta ya se creó
  }

  return nueva;
};

/**
 * ==========================================
 * 3. APORTES: UBICACIONES E IMÁGENES
 * ==========================================
 */

export const agregarUbicacion = async (
  plantaId,
  usuarioId,
  coords,
  fotoUrl,
  datos,
  nombrePlanta,
  alias,
  grupoId,
  nombreGrupo,
) => {
  // 1. Registro de la ubicación física
  const { data, error } = await supabase
    .from("ubicaciones")
    .insert([
      {
        planta_id: plantaId,
        usuario_id: usuarioId,
        foto_contexto: fotoUrl || "No aplica",
        latitud: coords.lat,
        longitud: coords.lng,
        ciudad: datos?.ciudad || "Desconocida",
        distrito: datos?.distrito || "Desconocida",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // 2. Definimos 'ahora' para que revisión y auditoría coincidan exactamente
  const ahora = new Date().toISOString();

  // 3. Registro del LOG con auto-auditoría completa
  await supabase.from("logs").insert([
    {
      planta_id: plantaId,
      nombre_planta: nombrePlanta,
      usuario_id: usuarioId,
      alias,
      grupo_id: grupoId,
      nombre_grupo: nombreGrupo,
      tipo_accion: "nueva_ubicacion",
      contenido: {
        url: fotoUrl || "No aplica",
      },
      latitud: coords.lat,
      longitud: coords.lng,
      ciudad: datos?.ciudad || "Desconocida",
      distrito: datos?.distrito || "Desconocido",

      // APROBACIÓN AUTOMÁTICA
      revisado: "aprobado",
      revisado_por: alias,
      fecha_revision: ahora,

      // AUDITORÍA AUTOMÁTICA
      auditado: "aprobado",
      auditado_por: alias,
      fecha_auditado: ahora,
    },
  ]);

  return data;
};

/**
 * ==========================================
 * 4. GESTIÓN Y AUDITORÍA (ADMIN/STAFF)
 * ==========================================
 */

export const getLogs = async (panelType) => {
  const query = supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (panelType === "actividades") {
    // El Muro Social: Solo nuevos hallazgos
    return await query.in("tipo_accion", ["nueva_planta", "nueva_ubicacion"]);
  }

  if (panelType === "gestion") {
    // El Laboratorio: Solo lo que requiere revisión (últimos 30 días si no es pendiente)
    const fecha30 = new Date();
    fecha30.setDate(fecha30.getDate() - 30);

    return await query
      .in("tipo_accion", ["nueva_imagen", "nuevo_nombre", "nuevo_comentario"])
      .or(`revisado.eq.pendiente,created_at.gte.${fecha30.toISOString()}`);
  }
};

export const eliminarUbicacionConFoto = async (idUbi, urlFoto) => {
  try {
    const partes = urlFoto.split("/upload/");
    if (partes.length < 2) throw new Error("URL inválida");
    const publicId = decodeURIComponent(
      partes[1].split("/").slice(1).join("/").split(".")[0],
    );
    const { error } = await supabase.functions.invoke(
      "eliminar-ubicacion-completa",
      { body: { ubiId: idUbi, publicId } },
    );
    return !error;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

/**
 * ==========================================
 * 5. OBJETO CONSOLIDADO (Sincronizador Maestro)
 * ==========================================
 */

export const plantaServices = {
  // Versión modular de registrar (puedes usar esta o crearEspecieNueva)
  registrarNuevaPlanta: async (datos) => {
    return await crearEspecieNueva(
      datos.nombreLocal,
      datos.urlFoto,
      datos.idUsuarioCreador,
      datos.aliasCreador,
      datos.paisSeleccionado,
      datos.grupoId,
      [datos.nombreLocal],
      [], // Se ajustará con la lógica interna de crearEspecieNueva
    );
  },

  actualizarPlanta: async (idPlanta, nuevosDatos) => {
    if (!idPlanta) throw new Error("ID de planta no proporcionado");

    let payload = { ...nuevosDatos };

    // --- SINCRONIZACIÓN AUTOMÁTICA ---
    // Si enviamos nombres_internacionales, actualizamos también 'nombres' y 'paises_nombre'
    if (nuevosDatos.nombres_internacionales) {
      const jsonLimpio = nuevosDatos.nombres_internacionales.map((b) => ({
        ...b,
        pais: b.pais.toUpperCase(),
        nombres: b.nombres.map((n) => ({
          ...n,
          texto: n.texto.trim(),
        })),
      }));

      // Sincronizamos con la columna 'nombres' (que es tu columna de búsqueda real)
      const arraySincronizado = [
        ...new Set(jsonLimpio.flatMap((b) => b.nombres.map((n) => n.texto))),
      ];

      payload.nombres_internacionales = jsonLimpio;
      payload.nombres = arraySincronizado; // Usamos 'nombres', no 'nombres_busqueda'
      payload.paises_nombre = jsonLimpio.map((b) => b.pais);
    }

    // --- EJECUCIÓN ---
    const { data, error } = await supabase
      .from("plantas")
      .update(payload)
      .eq("id", idPlanta)
      .select()
      .single();

    // Si hay error de esquema o permisos, aquí saltará al 'catch' de tu página
    if (error) throw error;

    if (!data) throw new Error("No se pudo actualizar: Planta no encontrada.");

    return data; // Devolvemos la planta actualizada directamente
  },
};

export const getActividadesCompletas = async () => {
  try {
    // ¡Mira qué simple! Una sola consulta a una sola tabla.
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false }); // Ordenamos de más nuevo a más viejo

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error obteniendo el historial unificado:", error);
    return [];
  }
};