import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Importa tus páginas
import { HomePage } from "../pages/HomePage";
import { LoginScreen } from "../context/LoginScreen";
import { DetallePage } from "../pages/DetallePage";
import { RegistroPlantaPage } from "../pages/RegistroPlantaPage";

export const AppRouter = () => {
  // Extraemos el estado de autenticación del contexto de Auth
  const { logged } = useContext(AuthContext);

  return (
    <Routes>
      {!logged ? (
        /* RUTAS PÚBLICAS: Si no está logueado, solo ve login */
        <>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* RUTAS PRIVADAS: Solo visibles si logged es true */
        <>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<RegistroPlantaPage />} />
          <Route path="/planta/:id" element={<DetallePage />} />

          {/* Redirecciones de seguridad */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};
