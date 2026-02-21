import { TiDelete } from "react-icons/ti";
import { useAuth } from "../../hooks/useAuth";
import { eliminarUbicacionConFoto } from "../../services/plantasServices";
import { RiDeleteBin6Line } from "react-icons/ri";

export const BotonEliminar = ({
  usuarioIdCreador,
  ubiId,
  fotoUrl,
  onEliminar,
}) => {
  const { user } = useAuth();

  // 🛡️ Lógica de permisos (Dueño o Admin)
  const esDueño = user?.id === usuarioIdCreador;
  const esAdmin = user?.rol === "Administrador";

  if (!(esDueño || esAdmin)) return null;

  const handleClick = async () => {
    if (window.confirm("¿Estás seguro de eliminar esta ubicación?")) {
      // 1. El botón ejecuta la acción en Cloudinary y Supabase
      const exito = await eliminarUbicacionConFoto(ubiId, fotoUrl);

      if (exito) {
        // 2. Si sale bien, avisamos al padre para limpiar la pantalla
        // Usamos el nombre 'onEliminar' que tú prefieres
        if (onEliminar) {
          onEliminar(ubiId);
        }
      } else {
        alert(
          "Error: No se pudo eliminar de la base de datos o de Cloudinary.",
        );
      }
    }
  };

  return (
    <div style={styles.contenedorEliminar}>
      <button
        style={styles.btnIcono}
        onClick={handleClick}
        title="Eliminar ubicación"
      >
        <RiDeleteBin6Line className="delete-icon" size={26} color="#ff4d4d" />
      </button>
    </div>
  );
};

const styles = {
  contenedorEliminar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnIcono: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0px",
    display: "flex",
    alignItems: "center",
  },
};
