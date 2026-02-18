import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BotonPrincipal,
  SeccionInformacion,
  BloqueIdentidad,
  CarruselDetalle,
  SeccionUbicaciones,
} from "../../components/index.js";
import { getDetallePlanta } from "../../services/plantasServices.js";
import { TbCloverFilled, TbReload } from "react-icons/tb";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useGPS } from "../../hooks/useGPS.js"
import "./DetallePage.css"


export const DetallePage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const esStaff = user?.rol === "Administrador" || user?.rol === "Colaborador";
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const { coords, errorGPS, cargandoGPS, refrescarGPS } = useGPS();

  // SOLUCIÓN AL SCROLL: Sube al inicio apenas carga el componente
  useEffect(() => {
    // 1. Desactivamos la restauración del navegador
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // 2. Forzamos el scroll al inicio con un pequeño retraso
    // Esto asegura que incluso si las imágenes tardan en cargar, el scroll suba
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 100); // 100ms es imperceptible para el ojo pero suficiente para el navegador
    return () => clearTimeout(timer); // Limpieza
  }, [planta]);

  // CARGA DE DATOS DESDE SUPABASE
  useEffect(() => {
    const fetchDatosCompletos = async () => {
      try {
        setLoading(true);
        // Promesa del tiempo mínimo (2 segundos)
        const tiempoMinimo = new Promise((resolve) =>
          setTimeout(resolve, 2000),
        );
        // Promesa de datos (Servicio)
        const miNombreGrupo = user?.grupos?.nombre_grupo;
        const consultaSupabase = getDetallePlanta(id, miNombreGrupo);
        // Esperamos a que ambas promesas terminen
        const [_, result] = await Promise.all([tiempoMinimo, consultaSupabase]);
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

  // --- RENDERIZADO DE CARGA ---
  if (loading) {
    return (
      <div className="loading-screen">
        <TbCloverFilled className="spinner" />
      </div>
    );
  }

  // Si no hay planta después de cargar, no renderizamos nada (o un error)
  if (!planta) return null;

  const tienePerfil =
    planta.foto_perfil?.length > 0 && planta.foto_perfil[0] !== null;

  // Si categoriaSeleccionada es null, usamos la lógica de prioridad, si no, lo que el usuario clickeó
  const categoriaActiva =
    categoriaSeleccionada || (tienePerfil ? "perfil" : "referencial");

  // 3. Filtrado de etiquetas (igual que antes)
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

  // 4. Lógica de fotos para el carrusel usando la "categoriaActiva" calculada
  const fotosActuales =
    categoriaActiva === "referencial"
      ? [planta.foto_referencial]
      : planta[`foto_${categoriaActiva}`] || [];

  const imagenesCarrusel =
    fotosActuales.length > 0 && fotosActuales[0] !== null
      ? fotosActuales
      : [null];

  const manejarEliminarUbicacion = (idUbi) => {
    try {
      // 2. Filtramos el estado local // Como 'planta' tiene una lista de 'ubicaciones', creamos un nuevo objeto
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
        <section className="carrusel-panel">
          {/* Componente del Carrusel */}
          <CarruselDetalle imagenes={imagenesCarrusel} key={categoriaActiva} />

          {/* Contenedor de Botones (Etiquetas) */}
          <div className="etiquetas-tecnicas-container">
            {opcionesVisibles.map((cat) => {
              // Calculamos el conteo para mostrar en el botón (1) (0) etc.
              const dataFotos =
                cat.id === "referencial"
                  ? [planta.foto_referencial]
                  : planta[`foto_${cat.id}`] || [];

              const conteo =
                Array.isArray(dataFotos) && dataFotos[0] === null
                  ? 0
                  : dataFotos.length;

              return (
                <button
                  key={cat.id}
                  className={`btn-etiqueta ${categoriaActiva === cat.id ? "active" : ""}`}
                  onClick={() => setCategoriaSeleccionada(cat.id)}
                >
                  {cat.label} ({conteo})
                </button>
              );
            })}
          </div>
        </section>

        {/* PANEL DERECHO: TEXTO AGRUPADO */}
        <section className="info-panel">
          <div className="info-content-scroll">
            <BloqueIdentidad planta={planta} />
            <SeccionInformacion planta={planta} />

            {/* Contenedor unificado de acciones */}
            <div
              className="btn-container"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* 1. Botón Público: Agregar Ubicación */}
              <BotonPrincipal
                texto="AGREGAR UBICACIÓN"
                onClick={() =>
                  navigate("/registro", {
                    state: {
                      plantaId: planta.id,
                      nombres_planta: planta.nombres_planta,
                      flujo: "ubicacion", // Clarificamos el flujo
                    },
                  })
                }
              />

              {/* 2. Botones exclusivos para Staff */}
              {esStaff && (
                <>
                  <BotonPrincipal
                    texto="AGREGAR NOMBRE"
                    color="#8d6e63" // Marrón madera para diferenciar
                    onClick={() =>
                      navigate("/registro", {
                        state: {
                          plantaId: planta.id,
                          nombres_planta: planta.nombres_planta,
                          esDetalleStaff: true, // Activa el flujo de nombre extra
                        },
                      })
                    }
                  />

                  <BotonPrincipal
                    texto="AGREGAR IMAGEN"
                    color="#455a64" // Gris azulado para técnico
                    onClick={() =>
                      navigate("/registro", {
                        state: {
                          plantaId: planta.id,
                          nombres_planta: planta.nombres_planta,
                          esImagenTecnica: true, // Activa el flujo de imagen técnica
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