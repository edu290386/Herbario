import { supabase } from "../supabaseClient";

export const getDashboardStats = async (userId, grupoId) => {
  // 1. Validación mínima: El userId es obligatorio
  if (!userId) {
    console.warn("⚠️ getDashboardStats: Falta el ID de usuario.");
    return null;
  }

  try {
    let idsGrupo = [userId];

    // 2. Lógica de Miembros: Solo buscamos si existe un grupo real
    if (grupoId && grupoId !== "undefined" && grupoId !== "null") {
      const { data: miembros, error: errM } = await supabase
        .from("usuarios")
        .select("id")
        .eq("grupo_id", grupoId);

      if (!errM && miembros && miembros.length > 0) {
        idsGrupo = miembros.map((m) => m.id);
      }
    }

    // 3. Traer los registros (ubicaciones) de los IDs seleccionados
    const { data: ubicaciones, error: errU } = await supabase
      .from("ubicaciones")
      .select("created_at, usuario_id")
      .in("usuario_id", idsGrupo);

    if (errU) throw errU;
    const ubi = ubicaciones || [];

    // --- LÓGICA DE TIEMPO ---
    const ahora = new Date();
    const hoyMs = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
    ).getTime();

    const unaSemana = 7 * 24 * 60 * 60 * 1000;
    const unMes = 30 * 24 * 60 * 60 * 1000;
    const unAño = 365 * 24 * 60 * 60 * 1000;

    const filtrar = (lista, desdeMs) =>
      lista.filter((u) => new Date(u.created_at).getTime() >= desdeMs).length;

    // Separamos registros del usuario actual
    const mias = ubi.filter((u) => u.usuario_id === userId);

    // --- CÁLCULO DE PARTICIPACIÓN ---
    const totalGrupo = ubi.length;
    const totalMio = mias.length;

    // Si no hay grupo, la participación es siempre 100%
    const tieneGrupo = grupoId && grupoId !== "undefined";
    const porcentaje = tieneGrupo
      ? totalGrupo > 0
        ? Math.round((totalMio / totalGrupo) * 100)
        : 0
      : 100;

    return {
      individual: {
        hoy: filtrar(mias, hoyMs),
        semana: filtrar(mias, hoyMs - unaSemana),
        mes: filtrar(mias, hoyMs - unMes),
        año: filtrar(mias, hoyMs - unAño),
        total: totalMio,
      },
      grupal: {
        hoy: filtrar(ubi, hoyMs),
        semana: filtrar(ubi, hoyMs - unaSemana),
        mes: filtrar(ubi, hoyMs - unMes),
        año: filtrar(ubi, hoyMs - unAño),
        total: totalGrupo,
      },
      participacion: {
        porcentaje: porcentaje,
        texto: tieneGrupo
          ? `${totalMio} de ${totalGrupo} registros`
          : `${totalMio} registros totales`,
      },
    };
  } catch (err) {
    console.error("❌ Error en getDashboardStats:", err.message);
    return null;
  }
};
