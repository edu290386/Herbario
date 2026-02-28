import { useReducer, useMemo, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { authReducer } from "./authReducer";
import { types } from "../types/types";
import { supabase } from "../supabaseClient";

const init = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    logged: !!user,
    user: user,
  };
};

export const AuthProvider = ({ children }) => {
  const [auth, dispatch] = useReducer(authReducer, {}, init);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    dispatch({ type: types.logout });
  }, []);

  const login = useCallback((usuario = {}) => {
    localStorage.setItem("user", JSON.stringify(usuario));
    dispatch({ type: types.login, payload: usuario });
  }, []);

  const verificarSesion = useCallback(async () => {
    if (!auth.user?.id) return true;

    try {
      // 1. CONSULTA SELECTIVA: Traemos solo lo que queremos que sea automático
      // OJO: No seleccionamos 'nombre' ni 'apellido' para que no se actualicen en caliente
      const { data: dbUser, error } = await supabase
        .from("usuarios")
        .select("login_token, rol, status, suscripcion_vence, modo_acceso")
        .eq("id", auth.user.id)
        .single();

      if (error || !dbUser) throw new Error("Usuario no encontrado");

      const ahora = new Date();
      const vencimiento = new Date(dbUser.suscripcion_vence);
      let statusActual = dbUser.status;

      // 2. AUTO-SUSPENSIÓN SILENCIOSA
      if (statusActual !== "BLOQUEADO" && ahora > vencimiento) {
        statusActual = "SUSPENDIDO";
        await supabase
          .from("usuarios")
          .update({ status: "SUSPENDIDO" })
          .eq("id", auth.user.id);
      }

      // 3. SEGURIDAD: Expulsión
      const esTokenDiferente = dbUser.login_token !== auth.user.login_token;
      const modoRestringido = !["libre", "doble_dispositivo"].includes(
        dbUser.modo_acceso,
      );

      if (
        statusActual === "BLOQUEADO" ||
        (modoRestringido && dbUser.login_token && esTokenDiferente)
      ) {
        console.warn("🚫 Acceso denegado o sesión duplicada.");
        logout();
        return false;
      }

      // 4. SINCRONIZACIÓN AUTOMÁTICA (Solo Rol, Status y Tiempo)
      // Comparamos los valores específicos que SI queremos que cambien
      const huboCambioCritico =
        dbUser.rol !== auth.user.rol ||
        statusActual !== auth.user.status ||
        dbUser.suscripcion_vence !== auth.user.suscripcion_vence;

      if (huboCambioCritico) {
        console.log("♻️ Actualizando Rol/Status/Tiempo en tiempo real...");

        const usuarioActualizado = {
          ...auth.user, // Mantenemos Nombre y Apellido originales de la sesión
          rol: dbUser.rol, // Aplicamos el nuevo Rol automáticamente
          status: statusActual, // Aplicamos el nuevo Status automáticamente
          suscripcion_vence: dbUser.suscripcion_vence, // Aplicamos el nuevo Tiempo automáticamente
        };

        dispatch({ type: types.login, payload: usuarioActualizado });
        localStorage.setItem("user", JSON.stringify(usuarioActualizado));
      }

      return true;
    } catch (error) {
      console.error("Vigilante Error:", error.message);
      return true;
    }
  }, [auth.user, logout, dispatch]); // Agregamos dispatch a dependencias

  const authValue = useMemo(
    () => ({ ...auth, login, logout, verificarSesion }),
    [auth, login, logout, verificarSesion],
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
