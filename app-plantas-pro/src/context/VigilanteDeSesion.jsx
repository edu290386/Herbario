import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

const RUTAS_CRITICAS = ["/", "/home", "/registro", "/planta", "/panel"];

export const VigilanteDeSesion = ({ children }) => {
  const { verificarSesion, user, logged, logout } = useContext(AuthContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay sesión, no hay nada que vigilar
    if (!logged || !user) return;

    // Evitar bucles: si ya estamos en la página de pago, no hacemos nada
    if (pathname === "/perfil") return;

    const revisarAcceso = async () => {
      const esRutaCritica = RUTAS_CRITICAS.some(
        (ruta) => pathname === ruta || pathname.startsWith(ruta + "/"),
      );

      if (esRutaCritica) {
        const ahora = new Date();
        const vencimiento = new Date(user.suscripcion_vence);

        // --- 1. LÓGICA DE AUTO-REPARACIÓN (Vencimiento manda) ---

        // Caso A: TIENE TIEMPO pero el status dice SUSPENDIDO -> Reactivamos
        if (vencimiento > ahora && user.status !== "ACTIVO") {
          console.log(
            "♻️ Vigilante: Días válidos detectados. Reactivando status...",
          );
          try {
            await supabase
              .from("usuarios")
              .update({ status: "ACTIVO" })
              .eq("id", user.id);

            // Forzamos la actualización del estado global de la app
            await verificarSesion();
            return;
          } catch (e) {
            console.error("Error al auto-activar:", e);
          }
        }

        // Caso B: NO TIENE TIEMPO pero el status dice ACTIVO -> Suspendemos
        if (vencimiento <= ahora && user.status !== "SUSPENDIDO") {
          console.log(
            "⚠️ Vigilante: Suscripción vencida. Cambiando a SUSPENDIDO...",
          );
          try {
            await supabase
              .from("usuarios")
              .update({ status: "SUSPENDIDO" })
              .eq("id", user.id);

            await verificarSesion();
          } catch (e) {
            console.error("Error al auto-suspender:", e);
          }
          navigate("/perfil");
          return;
        }

        // --- 2. VALIDACIÓN FINAL DE ACCESO ---
        if (user.status === "SUSPENDIDO" || user.status === "PENDIENTE") {
          navigate("/perfil");
          return;
        }

        // --- 3. INTEGRIDAD DE HARDWARE ---
        const esValido = await verificarSesion();
        if (!esValido) {
          logout();
          navigate("/login");
        }
      }
    };

    revisarAcceso();

    // ✅ Se agregaron todas las dependencias necesarias para evitar el warning de React
  }, [pathname, logged, user, navigate, logout, verificarSesion]);

  return children;
};
