import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Páginas
import { HomePage } from "../pages/Home/HomePage";
import { LoginScreen } from "../context/LoginScreen";
import { DetallePage } from "../pages/Detalle/DetallePage";
import { RegistroPlantaPage } from "../pages/Registro/RegistroPlantaPage";

// Componentes Globales
import { Footer } from "../components/ui/Footer";

export const AppRouter = () => {
  const { logged } = useContext(AuthContext);

  return (
    /* Contenedor principal: 
       - minHeight: 100vh asegura que ocupe toda la pantalla.
       - flex-direction: column + marginTop: auto en el footer lo empuja al fondo.
    */
    <div style={styles.layout}>
      <div style={styles.content}>
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
          <Route
            path="/*"
            element={<Navigate to={logged ? "/" : "/login"} />}
          />
        </Routes>
      </div>

      {/* Solo mostramos el footer si el usuario está dentro de la app */}
      {logged && <Footer />}
    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--color-nieve)", // Fondo global
  },
  content: {
    flex: 1, // Esto hace que el área de rutas crezca y ocupe todo el espacio disponible
    display: "flex",
    flexDirection: "column",
  },
};
