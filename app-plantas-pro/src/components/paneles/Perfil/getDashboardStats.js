import { supabase } from "../../../supabaseClient";

export const getDashboardStats = async (userId, grupoId) => {
  // 1. Validación inicial
  if (!userId || !grupoId || grupoId === "undefined") {
    console.warn("⚠️ getDashboardStats: Faltan IDs válidos.");
    return null;
  }

  try {
    // 2. Obtener todos los miembros del grupo para saber el total grupal
    const { data: miembros, error: errM } = await supabase
      .from("usuarios")
      .select("id")
      .eq("grupo_id", grupoId);

    if (errM) throw errM;
    if (!miembros || miembros.length === 0) return null;

    const idsGrupo = miembros.map((m) => m.id);

    // 3. Traer los registros (ubicaciones) de todo el grupo
    const { data: ubicaciones, error: errU } = await supabase
      .from("ubicaciones")
      .select("created_at, usuario_id")
      .in("usuario_id", idsGrupo);

    if (errU) throw errU;
    const ubi = ubicaciones || [];

    // --- LÓGICA DE TIEMPO (Milisegundos para evitar errores de zona horaria) ---
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
    const mías = ubi.filter((u) => u.usuario_id === userId);

    // --- CÁLCULO DE PARTICIPACIÓN ---
    const totalGrupo = ubi.length;
    const totalMio = mías.length;
    const porcentaje =
      totalGrupo > 0 ? Math.round((totalMio / totalGrupo) * 100) : 0;

    return {
      individual: {
        hoy: filtrar(mías, hoyMs),
        semana: filtrar(mías, hoyMs - unaSemana),
        mes: filtrar(mías, hoyMs - unMes),
        año: filtrar(mías, hoyMs - unAño),
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
        texto: `${totalMio} de ${totalGrupo} registros`,
      },
    };
  } catch (err) {
    console.error("❌ Error en getDashboardStats:", err.message);
    return null;
  }
};
