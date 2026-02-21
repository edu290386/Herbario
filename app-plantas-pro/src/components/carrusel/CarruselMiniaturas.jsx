import { transformarImagen } from "../../helpers/cloudinaryHelper";
import "./Carrusel.css";
import fondoRespaldo from "../../assets/fondo.jpg";

export const CarruselMiniaturas = ({
  imagenes,
  indiceActivo,
  setIndiceActivo,
}) => {
  // Si el array de imágenes está vacío, creamos uno con un elemento 'null'
  // para que el map renderice al menos una miniatura de respaldo.
  const listaImagenes = imagenes && imagenes.length > 0 ? imagenes : [null];

  return (
    <div className="miniaturas-container">
      {listaImagenes.map((img, i) => (
        <div
          key={i}
          onClick={() => setIndiceActivo(i)}
          className={`thumb-wrapper ${i === indiceActivo ? "active" : ""}`}
        >
          <img
            src={img ? transformarImagen(img, "card") : fondoRespaldo}
            className="img-thumb"
            alt={`Miniatura ${i}`}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};