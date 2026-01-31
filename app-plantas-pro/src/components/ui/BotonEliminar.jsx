import { MdDelete } from "react-icons/md";
import { useAuth } from "../context/AuthContext"; // Ajusta la ruta

export const BotonEliminar = ({ usuarioIdCreador, onConfirmar }) => {
  const { user } = useAuth();

  // 🛡️ Solo el dueño o un administrador pueden ver el botón
  const tienePermiso =
    user?.id === usuarioIdCreador || user?.rol === "Administrador";

  if (!tienePermiso) return null;

  const handleClick = () => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta ubicación?")
    ) {
      onConfirmar();
    }
  };

  return (
    <button onClick={handleClick} style={styles.btnDelete}>
      <MdDelete size={20} color="#ff4d4d" />
    </button>
  );
};

const styles = {
  btnDelete: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
