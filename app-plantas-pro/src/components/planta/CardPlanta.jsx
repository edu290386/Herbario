import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { OtrosNombres } from "../../components/planta/OtrosNombres";
import { transformarImagen } from "../../helpers/cloudinaryHelper";
import { BotonPrincipal } from "../ui/BotonPrincipal";
import { PiPlantThin } from "react-icons/pi";
import { resaltarTexto } from "../../helpers/highLightText";

export const CardPlanta = ({ planta , busqueda }) => {
  const navigate = useNavigate();
  const imagenPerfil = planta.foto_perfil?.[0];

  // Función centralizada para navegar al detalle
  const irADetalle = () => {
    navigate(`/planta/${planta.id}`, { state: { planta } });
  };

  return (
    <div className="card-planta">
      {/* 1. Contenedor de Imagen (Fijo 400px) */}
      <div className="card-contenedor-img" onClick={irADetalle}>
        {imagenPerfil ? ( // Ahora preguntamos por nuestra constante
          <img
            src={transformarImagen(imagenPerfil)} // Le pasamos el string limpio (la primera posición)
            alt={planta.nombres_planta?.[0]}
            className="card-img"
            loading="lazy"
          />
        ) : (
          <div className="card-fallback">
            <PiPlantThin
              size={100}
              color="var(--color-frondoso)"
              strokeWidth={1}
            />
          </div>
        )}
      </div>

      {/* 2. Área de Información */}
      <div className="card-info">
        <div className="card-texto">
          {/* Título interactivo */}
          <h2 className="card-nombre-comun" onClick={irADetalle}>
            {resaltarTexto(planta.nombres_planta?.[0], busqueda)}
          </h2>

          <p className="card-nombre-cientifico">
            <i>{planta.nombre_cientifico || "Nombre científico pendiente"}</i>
          </p>

          {/* Lista de nombres secundarios */}
          <div className="card-otros-nombres-container">
            <OtrosNombres lista={planta.nombres_planta} busqueda={busqueda} />
          </div>
        </div>

        {/* 3. Botón al fondo */}
        <BotonPrincipal
          texto="AGREGAR UBICACIÓN"
          onClick={(e) => {
            e.stopPropagation(); // Evita navegar al detalle al pulsar el botón
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