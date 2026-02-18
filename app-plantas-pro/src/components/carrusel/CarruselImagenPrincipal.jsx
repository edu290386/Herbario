import { transformarImagen } from "../../helpers/cloudinaryHelper";
import fondoRespaldo from "../../assets/fondo.jpg";
import { BotonVolver } from "../ui/BotonVolver";
import "./Carrusel.css";

export const CarruselImagenPrincipal = ({ url }) => {
  
  const imagenAMostrar = url
    ? transformarImagen(url, "detalle")
    : fondoRespaldo; // Aquí React ya sabe que es el archivo fondo.jpg

  return (
    <div className="main-image-wrapper">
      <BotonVolver />
      <img
        src={imagenAMostrar}
        alt="Imagen de la planta"
        className="img-principal-carrusel"
        // Si no hay url, no necesitamos lazy loading para el fondo local
        loading={url ? "lazy" : "eager"}
      />
    </div>
  );
};