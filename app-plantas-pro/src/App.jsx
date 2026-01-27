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
          /* RUTAS PRIVADAS */
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/registro-planta" element={<RegistroPlanta />} />
            <Route path="/planta/:id" element={<DetallePage />} />
            {/* Si intenta ir a cualquier otro lado, vuelve al Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};