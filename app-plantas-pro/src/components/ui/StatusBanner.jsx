import { GoCheckCircleFill, GoAlert } from "react-icons/go";
import { TfiAlert } from "react-icons/tfi";

export const StatusBanner = ({ status = "success", message, icon }) => {
  // Definimos los "temas" del banner
  const themes = {
    success: {
      bg: "#e8f5e9",
      border: "#4CAF5044",
      text: "#2e7d32",
      defaultIcon: <GoCheckCircleFill size={22} />,
    },
    warning: {
      bg: "#FFF9C4", // Tu amarillo crema
      border: "#856404",
      text: "#856404",
      defaultIcon: <GoAlert size={22} />,
    },
    error: {
      bg: "#fff5f5",
      border: "#feb2b2",
      text: "#d32f2f",
      defaultIcon: <TfiAlert size={22} />,
    },
  };

  const theme = themes[status] || themes.success;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.bg,
        color: theme.text,
        marginBottom: "15px",
        fontWeight: "500",
        transition: "all 0.3s ease",
      }}
    >
      {/* Usa el icono que mandes por prop, o el por defecto del tema */}
      <div style={{ display: "flex" }}>{icon || theme.defaultIcon}</div>

      <span style={{ fontSize: "0.95rem" }}>{message}</span>
    </div>
  );
};
