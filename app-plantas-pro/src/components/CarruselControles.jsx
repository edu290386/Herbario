import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { colores } from "../constants/tema";

export const CarruselControles = ({ onNext, onPrev }) => {
  return (
    <>
      <button onClick={onPrev} style={{ ...styles.navBtn, left: "15px" }}>
        <IoIosArrowBack size={24} />
      </button>
      <button onClick={onNext} style={{ ...styles.navBtn, right: "15px" }}>
        <IoIosArrowForward size={24} />
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
    width: "45px",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
    color: colores.bosque,
    backgroundColor: colores.retama, // Fondo amarillo original
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};
