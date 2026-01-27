import React, { useReducer, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authReducer } from "./AuthReducer";

// Esta función busca en el "hielo" (localStorage) antes de arrancar
const init = () => {
  const user = JSON.parse(localStorage.getItem("user_session"));
  return user || { logged: false };
};

export const AuthProvider = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, {}, init);

  // Cada vez que el authState cambie, lo guardamos en el localStorage
  useEffect(() => {
    if (!authState) return;
    localStorage.setItem("user_session", JSON.stringify(authState));
  }, [authState]);

  const login = (usuarioEnDB) => {
    const action = {
      type: "login",
      payload: usuarioEnDB,
    };
    dispatch(action);
  };

  const logout = () => {
    localStorage.removeItem("user_session");
    dispatch({ type: "logout" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState, // Esto pasa 'logged', 'nombre', 'rol', etc.
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
