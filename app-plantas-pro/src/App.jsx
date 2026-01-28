import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

// Pantallas
import { LoginScreen } from "./context/LoginScreen";
import { HomePage } from "./pages/HomePage";
import { DetallePage } from "./pages/DetallePage";
import { RegistroPlantaPage} from "./pages/RegistroPlantaPage"
export const App = () => {
  const { logged } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        {!logged ? (
          <>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          /* RUTAS PRIVADAS Solo visibles si logged es true */
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/registro" element={<RegistroPlantaPage />} />
            <Route path="/planta/:id" element={<DetallePage />} />
            {/* Si el usuario intenta volver al login estando logueado, lo mandamos al Home */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};