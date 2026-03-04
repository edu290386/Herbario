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
      // 1. SELECT CORREGIDO: Ahora sí traemos 'modo_acceso' (y asegúrate de que 'solo_movil' sea parte de modo_acceso o añádela)
      const { data: dbUser, error } = await supabase
        .from("usuarios")
        .select("login_token, rol, status, suscripcion_vence, modo_acceso")
        .eq("id", auth.user.id)
        .single();

      if (error || !dbUser) throw new Error("Usuario no encontrado");

      const ahora = new Date();
      const vencimiento = new Date(dbUser.suscripcion_vence);
      let statusActual = dbUser.status;

      // --- DETECCIÓN DE HARDWARE EN TIEMPO REAL ---
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // 2. AUTO-SUSPENSIÓN (Igual que antes)
      if (statusActual !== "BLOQUEADO" && ahora > vencimiento) {
        statusActual = "SUSPENDIDO";
        await supabase
          .from("usuarios")
          .update({ status: "SUSPENDIDO" })
          .eq("id", auth.user.id);
      }

      // 3. SEGURIDAD: Expulsión por Token O por Dispositivo No Autorizado
      const esTokenDiferente = dbUser.login_token !== auth.user.login_token;

      // REGLA CRÍTICA: ¿Es un perfil de "solo_movil" entrando desde Laptop?
      const esIntrusoLaptop = dbUser.modo_acceso === "solo_movil" && !isMobile;

      if (
        statusActual === "BLOQUEADO" ||
        esIntrusoLaptop || // <--- EL MARTILLO NUEVO
        (dbUser.modo_acceso !== "libre" &&
          dbUser.modo_acceso !== "doble_dispositivo" &&
          esTokenDiferente)
      ) {
        console.warn(
          "🚫 ACCESO DENEGADO: Dispositivo no autorizado o sesión duplicada.",
        );
        logout();
        return false;
      }

      // 4. SINCRONIZACIÓN (Añadimos modo_acceso para que el Vigilante lo vea)
      const huboCambioCritico =
        dbUser.rol !== auth.user.rol ||
        statusActual !== auth.user.status ||
        dbUser.modo_acceso !== auth.user.modo_acceso || // <--- Sincronizamos el modo
        dbUser.suscripcion_vence !== auth.user.suscripcion_vence;

      if (huboCambioCritico) {
        const usuarioActualizado = {
          ...auth.user,
          rol: dbUser.rol,
          status: statusActual,
          modo_acceso: dbUser.modo_acceso, // <--- Ahora el Vigilante tendrá este dato
          suscripcion_vence: dbUser.suscripcion_vence,
        };

        dispatch({ type: types.login, payload: usuarioActualizado });
        localStorage.setItem("user", JSON.stringify(usuarioActualizado));
      }

      return true;
    } catch (error) {
      console.error("Vigilante Error:", error.message);
      return false; // Si hay error de red, mejor denegar por seguridad
    }
  }, [auth.user, logout, dispatch]);

  const authValue = useMemo(
    () => ({ ...auth, login, logout, verificarSesion }),
    [auth, login, logout, verificarSesion],
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
