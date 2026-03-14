import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCamera, FaIdCard, FaCommentDots } from "react-icons/fa";
import { PiPlantFill } from "react-icons/pi";
import { FormImagen } from "./FormImagen";
import { FormNombre } from "./FormNombre";
import { FormComentario } from "./FormComentario";
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import "./CentroAportesPage.css";

export const CentroAportesPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 1. Recibimos los datos estándar MÁS los nuevos datos del reporte
  const {
    plantaId,
    nombrePlanta,
    conteoActual,
    nombresExistentes,
    flujo, // <-- Sabe si venimos a "reporte_ubicacion"
    ubicacionRef, // <-- ID de la ubicación a borrar
    distritoRef, // <-- Distrito de referencia
  } = state || {};

  // 2. EL INTERRUPTOR MÁGICO
  // Si venimos a reportar, abrimos "comentario" de frente. Si no, abrimos el menú (null).
  const [opcion, setOpcion] = useState(
    flujo === "reporte_ubicacion" ? "comentario" : null,
  );

  if (!plantaId) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <p>No se seleccionó ninguna planta. Regresa a la enciclopedia.</p>
        <button onClick={() => navigate("/")}>Volver</button>
      </div>
    );
  }

  // 3. CANCELACIÓN INTELIGENTE
  const manejarCancelacion = () => {
    if (flujo === "reporte_ubicacion") {
      // Si entró para reportar directo, cancelar lo saca de aquí y lo vuelve a la planta
      navigate(-1);
    } else {
      // Si entró por el menú normal, cancelar lo devuelve al menú de aportes
      setOpcion(null);
    }
  };

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
                  <p
                    style={{
                      color: "white",
                      margin: 0,
                      fontSize: "0.8rem",
                      opacity: 0.9,
                    }}
                  >
                    {nombrePlanta}
                  </p>
                </div>
              </header>

              <div
                className="card-opcion-aporte"
                onClick={() => setOpcion("imagen")}
              >
                <div className="icon-circle icon-verde">
                  <FaCamera />
                </div>
                <div className="card-text-content">
                  <h3>Nueva Fotografía</h3>
                  <p>Envía fotos de las diferentes partes de la planta</p>
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
                  <p>Comparte nombres regionales o de otros países.</p>
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
                  <h3>Enviar Comentario</h3>
                  <p>Reporta errores o añade información relevante.</p>
                </div>
              </div>

              <div
                className="registro-botones-footer"
                style={{ marginTop: "10px" }}
              >
                <div
                  className="boton-cancelar-wrapper"
                  onClick={() => navigate(-1)}
                >
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
            {opcion === "imagen" && (
              <FormImagen
                plantaId={plantaId}
                nombrePlanta={nombrePlanta}
                conteoActual={conteoActual}
                onCancel={manejarCancelacion}
              />
            )}
            {opcion === "nombre" && (
              <FormNombre
                plantaId={plantaId}
                nombrePlanta={nombrePlanta}
                nombresExistentes={nombresExistentes || []}
                onCancel={manejarCancelacion}
              />
            )}
            {opcion === "comentario" && (
              <FormComentario
                plantaId={plantaId}
                nombrePlanta={nombrePlanta}
                // Pasamos los props de reporte, si existen
                ubicacionRef={ubicacionRef}
                distritoRef={distritoRef}
                onCancel={manejarCancelacion}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
