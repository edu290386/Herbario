import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
// Importamos el Proveedor que creamos para que gestione la sesión
import { AuthProvider } from "./context/AuthProvider";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* El AuthProvider debe envolver a la App para "darle energía" al contexto */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
