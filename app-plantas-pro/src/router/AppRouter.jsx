import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { VigilanteDeSesion } from "../context/VigilanteDeSesion";

// Páginas
import { HomePage } from "../pages/Home/HomePage";
import { LoginScreen } from "../context/LoginScreen";
import { DetallePage } from "../pages/Detalle/DetallePage";
import { RegistroPlantaPage } from "../pages/Registro/RegistroPlantaPage";
import { PerfilPage } from "../pages/Perfil/PerfilPage";
import { Footer } from "../components/ui/Footer";

export const AppRouter = () => {
  const { logged, user } = useContext(AuthContext);

  return (
    <div style={styles.layout}>
      <div style={styles.content}>
        <VigilanteDeSesion>
          <Routes>
            {/* 1. RUTA PÚBLICA */}
            <Route
              path="/login"
              element={!logged ? <LoginScreen /> : <Navigate to="/" />}
            />

            {/* 2. PROTECCIÓN POR STATUS */}
            {logged && (
              <>
                {/* CASO PENDIENTE / SUSPENDIDO: Solo acceso a Perfil */}
                {(user?.status === "PENDIENTE" ||
                  user?.status === "SUSPENDIDO") && (
                  <>
                    <Route
                      path="/perfil"
                      element={<PerfilPage user={user} />}
                    />
                    <Route path="*" element={<Navigate to="/perfil" />} />
                  </>
                )}

                {/* CASO ACTIVO: Acceso Total */}
                {user?.status === "ACTIVO" && (
                  <>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/registro" element={<RegistroPlantaPage />} />
                    <Route path="/planta/:id" element={<DetallePage />} />
                    <Route
                      path="/perfil"
                      element={<PerfilPage user={user} />}
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </>
                )}
              </>
            )}

            {/* Si no está logueado o ninguna ruta coincide */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </VigilanteDeSesion>
      </div>

      {/* Footer solo para activos */}
      {logged && user?.status === "ACTIVO" && <Footer />}
    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  content: { flex: 1, display: "flex", flexDirection: "column" },
};
