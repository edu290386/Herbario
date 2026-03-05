import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDetallePlanta } from "../../services/plantasServices.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useGPS } from "../../hooks/useGPS.js";
import { FaCommentMedical } from "react-icons/fa6";

// Componentes modulares
import { InfoHeader } from "../../components/planta/InfoHeader.jsx";
import { InfoEtiquetas } from "../../components/planta/InfoEtiquetas.jsx";
import { FichaInteractiva } from "./FichaInteractiva.jsx";
import { CarruselPrincipal } from "../../components/planta/CarruselPrincipal.jsx";

// UI
import { BotonPrincipal, SeccionUbicaciones } from "../../components/index.js";
import { Spinner } from "../../components/ui/Spinner.jsx";

import "./DetallePage.css";

export const DetallePage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const { coords, errorGPS, cargandoGPS, refrescarGPS } = useGPS();

  // Reset de scroll al cargar planta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [planta]);

  // Carga de datos
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        const miNombreGrupo = user?.grupos?.nombre_grupo;
        const result = await getDetallePlanta(id, miNombreGrupo);
        setPlanta(result);
      } catch (error) {
        console.error("Error cargando planta:", error.message);
      } finally {
        setLoading(false);
      }
    };
    if (id && user) fetchDatos();
  }, [id, user]);

  if (loading) return <Spinner mensaje="Cargando enciclopedia..." />;
  if (!planta) return null;

  // Lógica de Carrusel
  const tienePerfil =
    planta.foto_perfil?.length > 0 && planta.foto_perfil[0] !== null;
  const categoriaActiva =
    categoriaSeleccionada || (tienePerfil ? "perfil" : "referencial");

  const categorias = [
    { id: "perfil", label: "PERFIL" },
    { id: "referencial", label: "REFERENCIAL" },
    { id: "hoja", label: "HOJA" },
    { id: "tallo", label: "TALLO" },
    { id: "flor", label: "FLOR" },
    { id: "fruto", label: "FRUTO" },
    { id: "semilla", label: "SEMILLA" },
    { id: "raiz", label: "RAIZ" },
  ];

  const opcionesVisibles = categorias.filter((cat) => {
    const fotos =
      cat.id === "referencial"
        ? planta.foto_referencial
        : planta[`foto_${cat.id}`];
    return Array.isArray(fotos)
      ? fotos.length > 0 && fotos[0] !== null
      : !!fotos;
  });

  const irACentroAportes = () => {
    const conteoFotos = {
      hoja: planta.foto_hoja?.filter((f) => f !== null).length || 0,
      tallo: planta.foto_tallo?.filter((f) => f !== null).length || 0,
      flor: planta.foto_flor?.filter((f) => f !== null).length || 0,
      fruto: planta.foto_fruto?.filter((f) => f !== null).length || 0,
      semilla: planta.foto_semilla?.filter((f) => f !== null).length || 0,
      raiz: planta.foto_raiz?.filter((f) => f !== null).length || 0,
    };

    navigate("/aportes", {
      state: {
        plantaId: planta.id,
        nombrePlanta: planta.nombres?.[0],
        conteoActual: conteoFotos,
      },
    });
  };

  const fotosActuales =
    categoriaActiva === "referencial"
      ? [planta.foto_referencial]
      : planta[`foto_${categoriaActiva}`] || [];
  const imagenesCarrusel = fotosActuales.filter((img) => img !== null);

  return (
    <div className="detalle-wrapper">
      <div className="burbuja-aporte-flotante" onClick={irACentroAportes}>
        <FaCommentMedical className="burbuja-fondo" />
      </div>

      <main className="main-block">
        <section className="carrusel-panel">
          <CarruselPrincipal
            imagenes={imagenesCarrusel}
            key={categoriaActiva}
          />
          <div className="etiquetas-pildora-container">
            {opcionesVisibles.map((cat) => (
              <button
                key={cat.id}
                className={`btn-pildora ${categoriaActiva === cat.id ? "active" : ""}`}
                onClick={() => setCategoriaSeleccionada(cat.id)}
              >
                {cat.label} (
                {Array.isArray(planta[`foto_${cat.id}`])
                  ? planta[`foto_${cat.id}`].filter((f) => f !== null).length
                  : 1}
                )
              </button>
            ))}
          </div>
          <div style={{ padding: "0 20px", marginTop: "-5px" }}>
            <InfoEtiquetas listaEtiquetasBotanicas={planta.etiquetas_tags} />
          </div>
        </section>

        <section className="info-panel">
          <div className="info-content-scroll">
            <InfoHeader
              nombrePrincipal={planta.nombres?.[0]}
              nombreCientifico={planta.nombre_cientifico}
              redes={planta.enlaces_redes}
            />

            <FichaInteractiva planta={planta} />

            <div className="btn-container" style={{ marginTop: "30px" }}>
              <BotonPrincipal
                texto="AGREGAR UBICACIÓN"
                onClick={() =>
                  navigate("/registro", {
                    state: {
                      plantaId: planta.id,
                      nombres_planta: planta.nombres,
                      flujo: "ubicacion",
                    },
                  })
                }
              />
            </div>
          </div>
        </section>
      </main>

      <section className="ubicaciones-block">
        <SeccionUbicaciones
          ubicaciones={planta.ubicaciones || []}
          nombrePlanta={planta.nombres?.[0]}
          userCoords={coords}
          errorGPS={errorGPS}
          cargandoGPS={cargandoGPS}
          refrescarGPS={refrescarGPS}
          onEliminar={(idUbi) =>
            setPlanta((prev) => ({
              ...prev,
              ubicaciones: prev.ubicaciones.filter((u) => u.id !== idUbi),
            }))
          }
        />
      </section>
    </div>
  );
};
