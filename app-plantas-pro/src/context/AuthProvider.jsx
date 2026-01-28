import { useReducer } from "react";
import { AuthContext } from "./AuthContext";
import { authReducer, types } from "./AuthReducer";

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
    // 1. Guardamos en el almacenamiento del navegador
    localStorage.setItem("user", JSON.stringify(usuario));

    // 2. Creamos la acción para el reducer
    const action = {
      type: types.login,
      payload: usuario,
    };

    // 3. Disparamos el cambio global
    dispatch(action);
  };

  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: types.logout });
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth, // Esto pasa 'logged' y 'user' directamente
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};