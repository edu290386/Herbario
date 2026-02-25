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
   // ✅ Agregamos doble_dispositivo a la lista blanca de no-validación
   const modo = auth.user?.modo_acceso;
   if (!auth.user?.id || modo === "libre" || modo === "doble_dispositivo") {
     return true;
   }

   try {
     const { data, error } = await supabase
       .from("usuarios")
       .select("login_token")
       .eq("id", auth.user.id)
       .single();

     if (error) throw error;

     if (data && data.login_token !== auth.user.login_token) {
       console.warn("🚫 Sesión duplicada. Expulsando...");
       logout();
       return false;
     }
     return true;
   } catch (error) {
      console.log(error)
     return true;
   }
 }, [auth.user?.id, auth.user?.login_token, auth.user?.modo_acceso, logout]);

  const authValue = useMemo(
    () => ({
      ...auth,
      login,
      logout,
      verificarSesion,
    }),
    [auth, login, logout, verificarSesion], // Ahora todas las dependencias están incluidas
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
