import { useNavigate } from "react-router-dom";
import { IoIosHome } from "react-icons/io";
import { colores } from "../../constants/tema";
import { ImHome } from "react-icons/im";

export const BotonVolver = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} style={styles.btnBack}>
      <ImHome size={26} color={colores.bosque} />
    </button>
  );
};

const styles = {
  btnBack: {
    display: "flex",
    alignItems: "center",
    padding: "8px 14px 8px 14px",
    backgroundColor: colores.retama,
    color: colores.bosque,
    border: "none",
    borderRadius: "11px",
    cursor: "pointer",
    fontWeight: 750,
    position: "absolute", // Para que flote sobre la imagen
    top: "20px",
    left: "32px",
    zIndex: 10,
  },
};