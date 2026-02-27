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
    const action = {
      type: types.login,
      payload: usuario,
    };
    dispatch(action);
  }, []);

  // ✅ USAMOS useCallback para que la referencia no cambie
  // y pueda usarse en dependencias de useEffect sin problemas.
const verificarSesion = useCallback(async () => {
  // Si no hay ID, no hay nada que vigilar
  if (!auth.user?.id) return true;

  try {
    // 1. Traemos el Token y el Rol actual de la DB
    const { data, error } = await supabase
      .from("usuarios")
      .select("login_token, rol")
      .eq("id", auth.user.id)
      .single();

    if (error) throw error;

    // 2. VERIFICACIÓN DE TOKEN (Hard Reset o Sesión Duplicada)
    // Si el token es null (Hard Reset) o diferente al actual (Sesión en otro lado)
    // EXCEPTO para modo 'libre' o 'doble_dispositivo' (aquí solo validamos si es null)
    const esTokenNull = data.login_token === null;
    const esTokenDiferente = data.login_token !== auth.user.login_token;
    const modoRestringido = !["libre", "doble_dispositivo"].includes(
      auth.user.modo_acceso,
    );

    if (esTokenNull || (modoRestringido && esTokenDiferente)) {
      console.warn("🚫 Sesión invalidada por el Administrador. Expulsando...");
      logout();
      return false;
    }

    // 3. VERIFICACIÓN DE ROL (Sincronización instantánea)
    if (data.rol !== auth.user.rol) {
      console.log("🔄 Cambio de Rol detectado. Actualizando perfil...");
      // Aquí podrías llamar a una función que actualice el estado 'auth'
      // con el nuevo rol sin cerrar sesión, o simplemente forzar logout
      // para que entre con los nuevos privilegios:
      logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error en Vigilante:", error.message);
    return true; // En caso de error de red, no expulsamos al usuario
  }
}, [
  auth.user?.id,
  auth.user?.login_token,
  auth.user?.rol,
  auth.user?.modo_acceso,
  logout,
]);

  // Este bloque expone todo el arsenal de autenticación a tu App
const authValue = useMemo(
  () => ({
    ...auth,           // Aquí viajan: user (con su rol, id, etc), logged, loading
    login,             // Función para entrar
    logout,            // Función para salir (el "hachazo" final)
    verificarSesion,   // El "Vigilante" que ahora detecta NULLs y cambios de Rol
  }),
  [auth, login, logout, verificarSesion] 
);

return (
  <AuthContext.Provider value={authValue}>
    {children}
  </AuthContext.Provider>
);
};
