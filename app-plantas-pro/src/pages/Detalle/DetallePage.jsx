import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDetallePlanta } from "../../services/plantasServices.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useGPS } from "../../hooks/useGPS.js";

// Importaciones de tus componentes intactos
import {
  BotonPrincipal,
  SeccionInformacion,
  BloqueIdentidad,
  SeccionUbicaciones,
} from "../../components/index.js";

// NUEVOS COMPONENTES (Ajusta la ruta según dónde los hayas guardado)
import { CarruselPrincipal } from "../../components/planta/CarruselPrincipal.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";

import "./DetallePage.css";

export const DetallePage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const esStaff = user?.rol === "Administrador" || user?.rol === "Colaborador";
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const { coords, errorGPS, cargandoGPS, refrescarGPS } = useGPS();

  // SOLUCIÓN AL SCROLL (Intacto)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 100);
    return () => clearTimeout(timer);
  }, [planta]);

  // CARGA DE DATOS (Optimizado: Quitamos el setTimeout de 2 segundos)
  useEffect(() => {
    const fetchDatosCompletos = async () => {
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
    if (id && user) {
      fetchDatosCompletos();
    }
  }, [id, user]);

  // --- RENDERIZADO DE CARGA (Con tu componente oficial) ---
  if (loading) {
    return <Spinner mensaje="Cargando información botánica..." />;
  }

  if (!planta) return null;

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

  const fotosActuales =
    categoriaActiva === "referencial"
      ? [planta.foto_referencial]
      : planta[`foto_${categoriaActiva}`] || [];

  // Filtramos nulls para no romper el carrusel
  const imagenesCarrusel = fotosActuales.filter((img) => img !== null);

  const manejarEliminarUbicacion = (idUbi) => {
    try {
      setPlanta((prevPlanta) => ({
        ...prevPlanta,
        ubicaciones: prevPlanta.ubicaciones.filter((u) => u.id !== idUbi),
      }));
    } catch (error) {
      alert("Error al actualizar la vista: " + error.message);
    }
  };

  return (
    <div className="detalle-wrapper">
      <main className="main-block">
        {/* === SECCIÓN CARRUSEL (Modificada) === */}
        <section className="carrusel-panel">
          {/* Componente del Nuevo Carrusel */}
          <CarruselPrincipal
            imagenes={imagenesCarrusel}
            key={categoriaActiva}
          />

          {/* Contenedor de Botones (Ahora con diseño de Píldoras) */}
          <div className="etiquetas-pildora-container">
            {opcionesVisibles.map((cat) => {
              const dataFotos =
                cat.id === "referencial"
                  ? [planta.foto_referencial]
                  : planta[`foto_${cat.id}`] || [];
              const conteo = Array.isArray(dataFotos)
                ? dataFotos.filter((f) => f !== null).length
                : dataFotos
                  ? 1
                  : 0;

              return (
                <button
                  key={cat.id}
                  className={`btn-pildora ${categoriaActiva === cat.id ? "active" : ""}`}
                  onClick={() => setCategoriaSeleccionada(cat.id)}
                >
                  {cat.label} ({conteo})
                </button>
              );
            })}
          </div>
        </section>

        {/* === PANEL DERECHO: TEXTO AGRUPADO (INTACTO) === */}
        <section className="info-panel">
          <div className="info-content-scroll">
            <BloqueIdentidad planta={planta} />
            <SeccionInformacion planta={planta} />

            {/* Contenedor unificado de acciones (INTACTO) */}
            <div
              className="btn-container"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <BotonPrincipal
                texto="AGREGAR UBICACIÓN"
                onClick={() =>
                  navigate("/registro", {
                    state: {
                      plantaId: planta.id,
                      nombres_planta: planta.nombres_planta,
                      flujo: "ubicacion",
                    },
                  })
                }
              />

              {esStaff && (
                <>
                  <BotonPrincipal
                    texto="AGREGAR NOMBRE"
                    color="#8d6e63"
                    onClick={() =>
                      navigate("/registro", {
                        state: {
                          plantaId: planta.id,
                          nombres_planta: planta.nombres_planta,
                          esDetalleStaff: true,
                        },
                      })
                    }
                  />

                  <BotonPrincipal
                    texto="AGREGAR IMAGEN"
                    color="#455a64"
                    onClick={() =>
                      navigate("/registro", {
                        state: {
                          plantaId: planta.id,
                          nombres_planta: planta.nombres_planta,
                          esImagenTecnica: true,
                        },
                      })
                    }
                  />
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* === SECCIÓN UBICACIONES (INTACTA) === */}
      <section className="ubicaciones-block">
        <SeccionUbicaciones
          ubicaciones={planta.ubicaciones || []}
          nombrePlanta={planta.nombres_planta?.[0]}
          userCoords={coords}
          errorGPS={errorGPS}
          cargandoGPS={cargandoGPS}
          refrescarGPS={refrescarGPS}
          onEliminar={manejarEliminarUbicacion}
        />
      </section>
    </div>
  );
};
