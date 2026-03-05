import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCamera, FaIdCard, FaCommentDots, FaArrowLeft } from "react-icons/fa";
import { FormImagen } from "./FormImagen";
import { FormNombre } from "./FormNombre";
import { FormComentario } from "./FormComentario";
import "./CentroAportesPage.css"

export const CentroAportesPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [opcion, setOpcion] = useState(null);

  // Datos que vienen de la DetallePage
  const { plantaId, nombrePlanta, conteoActual } = state || {};

  if (!plantaId) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <p>No se seleccionó ninguna planta. Regresa a la enciclopedia.</p>
        <button onClick={() => navigate("/")}>Volver</button>
      </div>
    );
  }

  return (
    <div className="centro-aportes-layout">
      <main className="container-aportes">
        {!opcion ? (
          <div className="oz-menu-centered-wrapper">
            <div className="menu-opciones-grid">
              <div
                className="card-opcion-aporte"
                onClick={() => setOpcion("imagen")}
              >
                <div className="icon-circle icon-verde">
                  <FaCamera />
                </div>
                <div className="card-text-content">
                  <h3>Nueva Fotografía</h3>
                  <p>Envía fotos de hojas, flores, frutos o tallos.</p>
                </div>
              </div>

              <div
                className="card-opcion-aporte"
                onClick={() => setOpcion("nombre")}
              >
                <div className="icon-circle icon-azul">
                  <FaIdCard />
                </div>
                <div className="card-text-content">
                  <h3>Sugerir Nombre</h3>
                  <p>¿Conoces otro nombre para esta planta?</p>
                </div>
              </div>

              <div
                className="card-opcion-aporte"
                onClick={() => setOpcion("comentario")}
              >
                <div className="icon-circle icon-naranja">
                  <FaCommentDots />
                </div>
                <div className="card-text-content">
                  <h3>Dato o Curiosidad</h3>
                  <p>Comparte consejos de cultivo o usos tradicionales.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="formulario-activo-wrapper">
            {opcion === "imagen" && (
              <FormImagen
                plantaId={plantaId}
                nombrePlanta={nombrePlanta}
                conteoActual={conteoActual}
                onCancel={() => setOpcion(null)}
              />
            )}
            {opcion === "nombre" && (
              <FormNombre
                plantaId={plantaId}
                nombrePlanta={nombrePlanta}
                onCancel={() => setOpcion(null)}
              />
            )}
            {opcion === "comentario" && (
              <FormComentario
                plantaId={plantaId}
                nombrePlanta={nombrePlanta}
                onCancel={() => setOpcion(null)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

