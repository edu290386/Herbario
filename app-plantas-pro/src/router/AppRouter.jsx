import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { VigilanteDeSesion } from "../context/VigilanteDeSesion";
// Páginas
import { HomePage } from "../pages/Home/HomePage";
import { LoginScreen } from "../context/LoginScreen";
import { DetallePage } from "../pages/Detalle/DetallePage";
import { RegistroPlantaPage } from "../pages/Registro/RegistroPlantaPage";
import { Footer } from "../components/ui/Footer";

export const AppRouter = () => {
  const { logged } = useContext(AuthContext);

  return (
    <div style={styles.layout}>
      <div style={styles.content}>
        {/* Envolvemos TODO con el Vigilante */}
        <VigilanteDeSesion>
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
              element={
                logged ? <RegistroPlantaPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/planta/:id"
              element={logged ? <DetallePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/*"
              element={<Navigate to={logged ? "/" : "/login"} />}
            />
          </Routes>
        </VigilanteDeSesion>
      </div>
      {logged && <Footer />}
    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--color-nieve)",
  },
  content: { flex: 1, display: "flex", flexDirection: "column" },
};
