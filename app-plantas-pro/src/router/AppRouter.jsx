import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Páginas
import { HomePage } from "../pages/HomePage";
import { LoginScreen } from "..//context/LoginScreen"; // ✅ Movido de context a pages
import { DetallePage } from "../pages/Detalle/DetallePage";
import { RegistroPlantaPage } from "../pages/Registro/RegistroPlantaPage";

export const AppRouter = () => {
  const { logged } = useContext(AuthContext);

  // Si estás validando el token, muestra un spinner y NO las rutas
  return (
    <Routes>
      <Route
        path="/login"
        element={!logged ? <LoginScreen /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={logged ? <HomePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/registro"
        element={logged ? <RegistroPlantaPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/planta/:id"
        element={logged ? <DetallePage /> : <Navigate to="/login" />}
      />
      <Route path="/*" element={<Navigate to={logged ? "/" : "/login"} />} />
    </Routes>
  );
};

