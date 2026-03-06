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

      // --- BLOQUE DE DEBUG PARA DISPOSITIVO ---
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // La prueba de fuego:
      if (user?.solo_movil && !isMobile) {
        console.error(
          "🚨 CRÍTICO: Este usuario tiene 'solo_movil' pero está en Laptop. El Vigilante debería sacarlo.",
        );
      }
      
      if (esRutaCritica) {
        // 🚨 1. REGLA SUPREMA: EL MARTILLO DE BANEO
        // Si está bloqueado, lo destruimos ANTES de mirar sus fechas
        if (user.status === "BLOQUEADO") {
          console.log("⛔ Usuario BLOQUEADO. Expulsando...");
          logout();
          navigate("/login");
          return; // 👈 Este return evita que el código siga y lo auto-active
        }

        const ahora = new Date();
        const vencimiento = new Date(user.suscripcion_vence);

        // --- 2. LÓGICA DE AUTO-REPARACIÓN ---
        // ✅ CORRECCIÓN: Solo curamos a los SUSPENDIDOS. Jamás usamos "!== ACTIVO"
        if (vencimiento > ahora && user.status === "SUSPENDIDO") {
          console.log(
            "♻️ Vigilante: Días válidos detectados. Reactivando status...",
          );
          try {
            await supabase
              .from("usuarios")
              .update({ status: "ACTIVO" })
              .eq("id", user.id);
            await verificarSesion();
            return;
          } catch (e) {
            console.error("Error al auto-activar:", e);
          }
        }

        // Caso B: NO TIENE TIEMPO pero el status dice ACTIVO -> Suspendemos
        if (vencimiento <= ahora && user.status === "ACTIVO") {
          try {
            await supabase
              .from("usuarios")
              .update({ status: "SUSPENDIDO" })
              .eq("id", user.id);
            await verificarSesion();
          } catch (e) {
            console.error(e);
          }
          navigate("/perfil");
          return;
        }

        // --- 3. VALIDACIÓN FINAL DE ACCESO ---
        if (user.status === "SUSPENDIDO") {
          navigate("/perfil");
          return;
        }

        // --- 4. INTEGRIDAD DE HARDWARE ---
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
