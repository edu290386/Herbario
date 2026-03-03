// src/components/ui/Copyright.jsx
import { TbCloverFilled } from "react-icons/tb";
import { FaRegCopyright } from "react-icons/fa";
import { appConfig } from "../../constants/appConfig";
import { colores } from "../../constants/tema";

export const Copyright = ({
  colorTexto = "#666",
  colorTrébol = "var(--color-frondoso)",
}) => {
  const year = new Date().getFullYear();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.3rem",
      }}
    >
      {/* 1. Logo y Empresa */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <TbCloverFilled style={{ color: colorTrébol, fontSize: "1.3rem" }} />
        <span
          style={{
            fontWeight: "700",
            color: "var(--color-carbon)",
            fontSize: "0.9rem",
            letterSpacing: "-0.5px",
          }}
        >
          Ile Merin Adde SAC
        </span>
      </div>

      {/* 2. Derechos y Año */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.8rem", color: colorTexto, margin: 0 }}>
          <FaRegCopyright color={colores.bosque} /> {year} • Todos los derechos
          reservados
        </p>
        <p style={{ fontSize: "0.8rem", color: colorTexto, margin: 0 }}>
          Herbolario {appConfig.version}
        </p>
      </div>
    </div>
  );
};
