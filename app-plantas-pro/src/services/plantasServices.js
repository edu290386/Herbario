import { supabase } from "../supabaseClient";
import { normalizarParaBusqueda, formatearParaDB } from "../helpers/textHelper";

export const checkNombreExistente = async (nombreUsuario) => {
  if (!nombreUsuario) return false;

  // 1. Traemos los nombres de la DB
  const { data: todasLasPlantas, error } = await supabase
    .from("plantas")
    .select("nombres");

  if (error) throw error;

  // 2. Limpiamos lo que escribió el usuario (Ej: "Áberikú" -> "aberiku")
  const nombreLimpioUsuario = normalizarParaBusqueda(nombreUsuario);

  // 3. Comparamos contra la DB limpiando también cada nombre de la DB
  const existe = todasLasPlantas.some((planta) =>
    planta.nombres.some(
      (n) => normalizarParaBusqueda(n) === nombreLimpioUsuario,
    ),
  );

  return existe;
};

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
  grupoId,
) => {
  // Usamos ParaDB para conservar acentos/diéresis en la visualización
  const nombreEstetico = formatearParaDB(nombre);

  const { data: nueva, error } = await supabase
    .from("plantas")
    .insert([
      {
        nombres: [nombreEstetico],
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
      revisado: "pendiente",
    },
  ]);
  return nueva;
};

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

  const ahora = new Date().toISOString();
  await supabase.from("logs").insert([
    {
      planta_id: plantaId,
      nombre_planta: nombrePlanta,
      usuario_id: usuarioId,
      alias,
      grupo_id: grupoId,
      nombre_grupo: nombreGrupo,
      tipo_accion: "nueva_ubicacion",
      contenido: fotoUrl,
      latitud: coords.lat,
      longitud: coords.lng,
      revisado: "aprobado",
      revisado_por: alias,
      fecha_revision: ahora,
    },
  ]);

  return data;
};

export const agregarDetalleStaff = async (
  plantaId,
  nuevoNombre,
  paisCodigo,
  user,
  nombrePlanta,
) => {
  const { error } = await supabase.from("logs").insert([
    {
      planta_id: plantaId,
      nombre_planta: nombrePlanta,
      usuario_id: user.id,
      alias: user.alias,
      grupo_id: user.grupo_id,
      tipo_accion: "nuevo_nombre",
      contenido: `${nuevoNombre}|${paisCodigo}`,
      revisado: "pendiente",
      auditado: "pendiente",
    },
  ]);

  if (error) throw error;
  return { id: plantaId };
};

export const registrarPropuestaImagen = async (
  plantaId,
  usuarioId,
  url,
  etiqueta,
  nombrePlanta,
  alias,
  grupoId,
) => {
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
    },
  ]);

  if (error) throw error;
  return { data, error };
};

export const getLogs = async (panelType) => {
  const query = supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (panelType === "actividades") {
    const fecha30 = new Date();
    fecha30.setDate(fecha30.getDate() - 30);
    const { data, error } = await query
      .or(`tipo_accion.eq.nueva_planta,tipo_accion.eq.nueva_ubicacion`)
      .gte("created_at", fecha30.toISOString());
    return { data: data || [], error };
  }

  if (panelType === "gestion") {
    const fecha7 = new Date();
    fecha7.setDate(fecha7.getDate() - 7);
    const { data, error } = await query
      .in("tipo_accion", [
        "nueva_imagen",
        "nuevo_nombre",
        "nombre_aprobado",
        "nombre_rechazado",
        "imagen_rechazada",
        "imagen_aprobada",
      ])
      .or(
        `revisado.eq.pendiente,revisado.is.null,and(revisado.neq.pendiente,created_at.gte.${fecha7.toISOString()})`,
      );
    return { data: data || [], error };
  }
  return { data: [], error: "Tipo de panel no reconocido" };
};

export const processProposal = async (proposal, comando, revisorAlias) => {
  const { id: logId, contenido, planta_id, tipo_accion } = proposal;
  const esAprobar = comando === "filtro_operativo_aprobar";

  let updateLogData = {
    revisado_por: revisorAlias,
    fecha_revision: new Date().toISOString(),
  };

  if (esAprobar) {
    updateLogData.revisado = "aprobado";
    if (tipo_accion === "nueva_imagen") {
      updateLogData.tipo_accion = "imagen_aprobada";
      const [etiqueta, url] = contenido.split("|").map((s) => s.trim());
      const columna = `foto_${etiqueta.toLowerCase()}`;
      const { data: p } = await supabase
        .from("plantas")
        .select(columna)
        .eq("id", planta_id)
        .single();
      const nuevoArray = [...(p?.[columna] || []), url];
      await supabase
        .from("plantas")
        .update({ [columna]: nuevoArray })
        .eq("id", planta_id);
    }
  } else {
    updateLogData.revisado = "rechazado";
  }

  const { data, error } = await supabase
    .from("logs")
    .update(updateLogData)
    .eq("id", logId)
    .select();
  if (error) throw error;
  return { success: true, data: data[0] };
};

export const eliminarUbicacionConFoto = async (idUbi, urlFoto) => {
  try {
    const partes = urlFoto.split("/upload/");
    if (partes.length < 2) throw new Error("URL de foto inválida");
    const publicId = decodeURIComponent(
      partes[1].split("/").slice(1).join("/").split(".")[0],
    );

    const { error } = await supabase.functions.invoke(
      "eliminar-ubicacion-completa",
      {
        body: { ubiId: idUbi, publicId },
      },
    );
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error en eliminarUbicacionConFoto:", error.message);
    return false;
  }
};
