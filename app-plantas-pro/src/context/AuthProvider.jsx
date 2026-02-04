import { useReducer } from "react";
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
   // Guardamos todo el objeto para tener el id, nombre y grupo a la mano
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

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
