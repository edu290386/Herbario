import { useNavigate } from "react-router-dom";
import { ImHome } from "react-icons/im";

export const BotonVolver = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/", { replace: true })}
      style={styles.btnBack}
      title="Volver al inicio"
      // Agregamos eventos de mouse para simular el hover sin necesidad de CSS externo
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.backgroundColor = "rgba(45, 139, 87, 0.9)"; // Tu verde frondoso al pasar el mouse
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)"; // Vuelve al cristal oscuro
      }}
    >
      <ImHome size={22} color="#ffffff" />
    </button>
  );
};

const styles = {
  btnBack: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px", // Mismo tamaño que la lupa y las flechas
    height: "44px", // Cuadrado perfecto para hacer el círculo
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Cristal oscuro semi-transparente
    border: "1px solid rgba(255, 255, 255, 0.2)", // Borde sutil blanco
    borderRadius: "50%", // Círculo perfecto
    cursor: "pointer",
    position: "absolute", // Flota sobre la imagen
    top: "15px",
    left: "15px",
    zIndex: 30, // Capa superior garantizada
    backdropFilter: "blur(4px)", // El efecto de vidrio empañado
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)", // Sombra para despegarlo del fondo
    transition: "all 0.2s ease", // Transición suave para el hover
  },
};
