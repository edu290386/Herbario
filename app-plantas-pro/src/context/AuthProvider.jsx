import { useReducer, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import { authReducer } from "./authReducer"; // Asegúrate de que el nombre coincida
import { types } from "../types/types"; // O donde tengas tus types

const init = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    logged: !!user,
    user: user,
  };
};

export const AuthProvider = ({ children }) => {
  const [auth, dispatch] = useReducer(authReducer, {}, init);

  const login = (usuario = {}) => {
    localStorage.setItem("user", JSON.stringify(usuario));
    const action = {
      type: types.login,
      payload: usuario,
    };
    dispatch(action);
  };

  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: types.logout });
  };

  // ✅ MEMORIZAMOS EL VALOR
  // Esto evita que el objeto cambie su dirección de memoria si el estado 'auth' es el mismo.
  // Sin esto, AppRouter siempre detecta un cambio y desmonta tu página de Registro.
  const authValue = useMemo(
    () => ({
      ...auth,
      login,
      logout,
    }),
    [auth],
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};