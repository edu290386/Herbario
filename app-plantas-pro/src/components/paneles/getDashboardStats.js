import { supabase } from "../../supabaseClient";

export const getDashboardStats = async (userId, grupoId) => {
  // Validación de seguridad para evitar el error de "invalid input syntax for type uuid"
  if (!userId || !grupoId || grupoId === "undefined" || grupoId === null) {
    console.warn("⚠️ getDashboardStats: ID de usuario o grupo no válido.", {
      userId,
      grupoId,
    });
    return null;
  }

  try {
    // 1. Obtener los IDs de todos los miembros del mismo grupo
    const { data: miembros, error: errorMiembros } = await supabase
      .from("usuarios")
      .select("id")
      .eq("grupo_id", grupoId); // Verifica que en tu tabla 'usuarios' la columna sea 'grupo_id'

    if (errorMiembros) throw errorMiembros;

    const idsGrupo = miembros.map((m) => m.id);

    // 2. Traer las ubicaciones de todos esos miembros
    const { data: ubicaciones, error: errorUbi } = await supabase
      .from("ubicaciones")
      .select("created_at, usuario_id")
      .in("usuario_id", idsGrupo);

    if (errorUbi) throw errorUbi;
console.log("ID Buscado:", userId);
console.log("Primer ID en la tabla:", ubicaciones[0]?.user_id);
    // --- CÁLCULOS DE TIEMPO (Timestamps) ---
    const ahora = new Date();
    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
    ).getTime();
    const semana = new Date(
      ahora.setDate(ahora.getDate() - ahora.getDay()),
    ).setHours(0, 0, 0, 0);
    const mes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();
    const año = new Date(ahora.getFullYear(), 0, 1).getTime();

    const filtrar = (lista, desde) =>
      lista.filter((u) => new Date(u.created_at).getTime() >= desde).length;

    // Separación de datos
    const mías = ubicaciones.filter((u) => u.usuario_id === userId);

    return {
      individual: {
        hoy: filtrar(mías, hoy),
        semana: filtrar(mías, semana),
        mes: filtrar(mías, mes),
        año: filtrar(mías, año),
      },
      grupal: {
        hoy: filtrar(ubicaciones, hoy),
        semana: filtrar(ubicaciones, semana),
        mes: filtrar(ubicaciones, mes),
        año: filtrar(ubicaciones, año),
      },
    };
  } catch (err) {
    console.error("❌ Error en getDashboardStats:", err.message);
    return null;
  }
};