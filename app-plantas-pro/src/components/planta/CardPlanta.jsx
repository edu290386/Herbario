import { useNavigate } from "react-router-dom";
import { OtrosNombres } from "../../components/planta/OtrosNombres";
import { transformarImagen } from "../../helpers/cloudinaryHelper";
import { BotonPrincipal } from "../ui/BotonPrincipal";
import { PiPlantThin } from "react-icons/pi";
import { resaltarTexto } from "../../helpers/highLightText";
import { colores } from "../../constants/tema";
import "./CardPlanta.css";

export const CardPlanta = ({ planta, busqueda }) => {
  const navigate = useNavigate();

  const irADetalle = () => {
    navigate(`/planta/${planta.id}`, { state: { planta } });
  };

  // 1. Simplificación extrema con Optional Chaining
  const imagenPerfil = planta.foto_perfil?.[0];
  const imagenFinal =
    typeof imagenPerfil === "string" ? transformarImagen(imagenPerfil) : null;

  return (
    <div className="card-planta">
      <div className="card-contenedor-img" onClick={irADetalle}>
        {imagenFinal ? (
          <img
            src={imagenFinal}
            alt={planta.nombres_planta?.[0]}
            className="card-img"
            loading="lazy"
          />
        ) : (
          <div className="card-fallback">
            <PiPlantThin size={100} color={colores.frondoso} strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="card-info">
        <div className="card-texto">
          <h2 className="card-nombre-comun" onClick={irADetalle}>
            {resaltarTexto(planta.nombres_planta?.[0], busqueda)}
          </h2>

          <p className="card-nombre-cientifico">
            <i>{planta.nombre_cientifico || "Nombre científico pendiente"}</i>
          </p>

          <div className="card-otros-nombres-container">
            <OtrosNombres lista={planta.nombres_planta} busqueda={busqueda} />
          </div>
        </div>

        <BotonPrincipal
          texto="AGREGAR UBICACIÓN"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/registro", {
              state: {
                plantaId: planta.id,
                nombres_planta: planta.nombres_planta,
              },
            });
          }}
          textoCargando="Redirigiendo..."
        />
      </div>
    </div>
  );
};
