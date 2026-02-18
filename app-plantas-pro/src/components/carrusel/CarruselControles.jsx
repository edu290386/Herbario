import { colores } from "../../constants/tema";
import "./Carrusel.css";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

export const CarruselControles = ({ onNext, onPrev }) => {
  return (
    <>
      <button
        onClick={onPrev}
        className="nav-btn-carrusel"
        style={{ left: "15px", backgroundColor: colores.retama }}
      >
        <FaAngleLeft
          size={35}
          color={colores.bosque}
          style={{ transform: "translateX(-1px)" }}
        />
      </button>
      <button
        onClick={onNext}
        className="nav-btn-carrusel"
        style={{
          right: "15px",
          backgroundColor: colores.retama,
        }}
      >
        <FaAngleRight
          size={35}
          color={colores.bosque}
          style={{ transform: "translateX(2px)" }}
        />
      </button>
    </>
  );
};