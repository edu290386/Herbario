import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ✅ Definimos las rutas fuera del componente.
// Al ser una constante estática, no necesita estar en el arreglo de dependencias.
const RUTAS_CRITICAS = ["/", "/registro", "/planta"];

export const VigilanteDeSesion = ({ children }) => {
  const { verificarSesion, user, logged } = useContext(AuthContext);
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Log de rastro inicial
    console.log("📍 Navegando a:", pathname);

    if (!logged || !user) {
      console.log("ℹ️ Vigilante: No hay usuario logueado, ignorando...");
      return;
    }

    // 2. Log de estado de tokens
    console.log("🔑 Mi Token Local:", user.login_token);
    console.log("👤 Mi ID:", user.id);

    // Verificamos si la ruta es crítica
    // Usamos exactitud o startsWith para rutas con ID como /planta/123
    const esRutaCritica = RUTAS_CRITICAS.some(
      (ruta) => pathname === ruta || pathname.startsWith(ruta + "/"),
    );

    if (esRutaCritica) {
      console.log(
        `🛡️ Punto de control ACTIVADO en: ${pathname}. Consultando DB...`,
      );

      // Llamamos a la función del Provider
      verificarSesion().then((esValido) => {
        if (!esValido) {
          console.log("❌ Resultado: Sesión inválida, logout ejecutado.");
        } else {
          console.log("✅ Resultado: Sesión válida.");
        }
      });
    } else {
      console.log("⚪ Ruta no crítica, saltando validación.");
    }
  }, [pathname, verificarSesion, user, logged]);

  return children;
};