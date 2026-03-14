import { RiDeleteBin6Line } from "react-icons/ri";
import { useAuth } from "../../hooks/useAuth";
import {
  eliminarUbicacionConFoto,
  registrarLogEliminacion,
} from "../../services/plantasServices";

export const BotonEliminar = ({ ubicacion, nombrePlanta, onEliminar }) => {
  const { user } = useAuth();

  // 🛡️ Lógica de permisos (Dueño o Admin)
  const esDueño = user?.id === ubicacion.usuario_id;
  const esAdmin = user?.rol === "Administrador";

  if (!(esDueño || esAdmin)) return null;

  const handleClick = async () => {
    if (
      window.confirm(
        "¿Estás seguro de eliminar esta ubicación de forma permanente?",
      )
    ) {
      // 1. Ejecutamos la acción física (Supabase + Cloudinary)
      const exito = await eliminarUbicacionConFoto(
        ubicacion.id,
        ubicacion.foto_contexto,
      );

      if (exito) {
        // 2. Si sale bien, creamos el LOG (Caja Negra)
        const tipoAccion = esDueño
          ? "eliminacion_por_usuario"
          : "eliminacion_por_staff";
        await registrarLogEliminacion(
          ubicacion,
          nombrePlanta,
          user,
          tipoAccion,
        );

        // 3. Avisamos al padre (UI)
        if (onEliminar) {
          onEliminar(ubicacion.id);
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
