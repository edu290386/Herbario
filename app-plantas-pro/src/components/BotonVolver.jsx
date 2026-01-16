import { useNavigate } from "react-router-dom";
import { IoMdReturnLeft } from "react-icons/io";
import { colores } from "../constants/tema";

export const BotonVolver = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} style={styles.btnBack}>
      <IoMdReturnLeft size={20} color={colores.bosque} />
      <span style={styles.text}>VOLVER</span>
    </button>
  );
};

const styles = {
  btnBack: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: colores.retama,
    color: colores.bosque,
    border: "none",
    borderRadius: "18px",
    cursor: "pointer",
    fontWeight: 750,
    position: "absolute", // Para que flote sobre la imagen
    top: "20px",
    left: "20px",
    zIndex: 10,
  },
  text: {
    marginLeft: "5px",
  },
};