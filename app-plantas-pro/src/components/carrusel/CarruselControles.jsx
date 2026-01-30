import {
  PiCaretDoubleRightBold,
  PiCaretDoubleLeftBold,
} from "react-icons/pi";
import { colores } from "../../constants/tema";

export const CarruselControles = ({ onNext, onPrev }) => {
  return (
    <>
      <button onClick={onPrev} style={{ ...styles.navBtn, left: "15px" }}>
        <PiCaretDoubleLeftBold size={30} />
      </button>
      <button onClick={onNext} style={{ ...styles.navBtn, right: "15px" }}>
        <PiCaretDoubleRightBold size={40} />
      </button>
    </>
  );
};

const styles = {
  navBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
    color: colores.bosque,
    backgroundColor: colores.retama,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};
