import { colores } from "../../constants/tema";
import { OtrosNombres } from "./OtrosNombres";
import { TfiWorld } from "react-icons/tfi";
import { PiLeafLight } from "react-icons/pi";
import "./BloqueIdentidad.css";

export const BloqueIdentidad = ({ planta, busqueda }) => {
  const nombres = planta.nombres_planta || [];
  const paises = planta.paises_nombre || [];

  const obtenerIconoPais = (pais) => {
    if (!pais) return null;
    const p = pais.trim().toLowerCase();

    // 1. Iconos de React Icons para casos especiales
    if (p === "world") {
      return (
        <TfiWorld
          className="icono-contexto"
          size="17px"
          style={{ marginLeft: "6px" }}
        />
      );
    }
    if (p === "sacred") {
      return (
        <PiLeafLight
          className="icono-contexto"
          size="20px"
          style={{ marginLeft: "6px" }}
        />
      );
    }

    // 2. Formato simple con paréntesis para códigos ISO (PE, MX, VE...)
    return (
      <span style={{ marginLeft: "6px", fontSize: "0.8em", color: colores.bosque }}>
        ({pais.toUpperCase()})
      </span>
    );
  };

  const listaProcesada = nombres.map((nom, i) => (
    <span key={i} className="identidad-item-fila">
      {nom} {obtenerIconoPais(paises[i])}
    </span>
  ));

  return (
    <div className="bloque-identidad">
      <h1 className="identidad-nombre-comun" style={{ color: colores.bosque }}>
        {nombres[0]} {obtenerIconoPais(paises[0])}
      </h1>
      <p className="identidad-nombre-cientifico">
        <i>{planta.nombre_cientifico}</i>
      </p>
      <div
        className="identidad-linea-acento"
        style={{ backgroundColor: colores.verdeClaro }}
      />
      <OtrosNombres lista={listaProcesada} busqueda={busqueda} />
    </div>
  );
};
