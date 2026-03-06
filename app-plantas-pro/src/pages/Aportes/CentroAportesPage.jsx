import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCamera, FaIdCard, FaCommentDots } from "react-icons/fa";
import { PiPlantFill } from "react-icons/pi"; // Importado para el icono de la cabecera
import { FormImagen } from "./FormImagen";
import { FormNombre } from "./FormNombre";
import { FormComentario } from "./FormComentario";
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import "./CentroAportesPage.css";

export const CentroAportesPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [opcion, setOpcion] = useState(null);

  // Datos que vienen de la DetallePage
  const { plantaId, nombrePlanta, conteoActual } = state || {};

  // Validación de seguridad si se accede sin estado
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
              <header className="aportes-header-banner">
                <div className="icon-circle icon-verde header-icon-main">
                  <PiPlantFill />
                </div>
                <div className="header-text-content">
                  <h1 className="registro-titulo">CONTROL DE APORTES</h1>
                </div>
              </header>
              {/* Opción: Nueva Fotografía */}
              <div
                className="card-opcion-aporte"
                onClick={() => setOpcion("imagen")}
              >
                <div className="icon-circle icon-verde">
                  <FaCamera />
                </div>
                <div className="card-text-content">
                  <h3>Nueva Fotografía</h3>
                  <p>
                    Envía fotos de las diferentes partes de la planta para la
                    galería
                  </p>
                </div>
              </div>

              {/* Opción: Sugerir Nombre */}
              <div
                className="card-opcion-aporte"
                onClick={() => setOpcion("nombre")}
              >
                <div className="icon-circle icon-azul">
                  <FaIdCard />
                </div>
                <div className="card-text-content">
                  <h3>Sugerir Nombre</h3>
                  <p>
                    Algunas plantas tienen nombres diferentes en distintas
                    regiones o países. Compártelos.
                  </p>
                </div>
              </div>

              {/* Opción: Dato o Curiosidad */}
              <div
                className="card-opcion-aporte"
                onClick={() => setOpcion("comentario")}
              >
                <div className="icon-circle icon-naranja">
                  <FaCommentDots />
                </div>
                <div className="card-text-content">
                  <h3>Enviar Comentario</h3>
                  <p>
                    Comparte Información o reporta errores y mejoras de la
                    planta
                  </p>
                </div>
              </div>

              {/* 🟢 EL BOTÓN DE ESCAPE: Volver a la planta */}
              <div
                className="registro-botones-footer"
                style={{ marginTop: "10px" }}
              >
                <div className="boton-cancelar-wrapper">
                  <BotonCancelar
                    texto="VOLVER A LA PLANTA"
                    variante="azul-slate-claro"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="formulario-activo-wrapper">
            {/* Renderizado condicional de los formularios */}
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
