import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDetallePlanta,
  plantaServices,
} from "../../services/plantasServices.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useGPS } from "../../hooks/useGPS.js";

// Nuevos componentes modulares del DNI de la Planta
import { InfoHeader } from "../../components/planta/InfoHeader.jsx";
import { InfoEtiquetas } from "../../components/planta/InfoEtiquetas.jsx";
import { InfoRedesSociales } from "../../components/planta/InfoRedesSociales.jsx";
import { InfoAcordeones } from "../../components/planta/InfoAcordeones.jsx";
import { SeccionNombresColaborativa } from "../../components/planta/SeccionNombresColaborativa.jsx";
import { CarruselPrincipal } from "../../components/planta/CarruselPrincipal.jsx";

// Componentes UI intactos
import { BotonPrincipal, SeccionUbicaciones } from "../../components/index.js";
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

  // CARGA DE DATOS
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

  if (loading) return <Spinner mensaje="Cargando enciclopedia..." />;
  if (!planta) return null;

  // LÓGICA DEL CARRUSEL
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

  // --- LÓGICA DE VOTACIÓN Y VERIFICACIÓN ---
  const handleVotarNombre = async (codigoPais, nombreTexto) => {
    try {
      const copiaNombres = [...(planta.nombres_internacionales || [])];
      const bloquePais = copiaNombres.find((p) => p.pais === codigoPais);
      const nombreObj = bloquePais.nombres.find((n) => n.texto === nombreTexto);

      // 1. Aumentamos el voto
      nombreObj.votos = (nombreObj.votos || 0) + 1;

      // 2. REGLA: ¿Quién verifica?
      let actualizacionBusqueda = {};
      if (!nombreObj.verificado) {
        if (esStaff || nombreObj.votos >= 5) {
          nombreObj.verificado = true;
          // Si se verifica, actualizamos el array de búsqueda del Home
          const nuevaListaBusqueda = [
            ...new Set([...(planta.nombres_busqueda || []), nombreTexto]),
          ];
          actualizacionBusqueda = { nombres_busqueda: nuevaListaBusqueda };
        }
      }

      // 3. Mandar a Supabase
      const { error } = await plantaServices.actualizarPlanta(planta.id, {
        nombres_internacionales: copiaNombres,
        ...actualizacionBusqueda,
      });

      if (error) throw error;

      // 4. Reflejar en pantalla
      setPlanta((prev) => ({
        ...prev,
        nombres_internacionales: copiaNombres,
        ...(actualizacionBusqueda.nombres_busqueda
          ? { nombres_busqueda: actualizacionBusqueda.nombres_busqueda }
          : {}),
      }));
    } catch (error) {
      console.error("Error al votar:", error);
    }
  };

  // --- LÓGICA DE SUGERENCIA (A prueba de duplicados) ---
  const handleSugerirNombre = async (sugerenciaForm) => {
    try {
      const copiaNombresInternacionales = [
        ...(planta.nombres_internacionales || []),
      ];
      const indicePais = copiaNombresInternacionales.findIndex(
        (p) => p.pais === sugerenciaForm.pais,
      );

      // Si es Staff, entra verificado automáticamente
      const nombreVerificado = esStaff;

      const nuevoNombreObj = {
        texto: sugerenciaForm.texto,
        verificado: nombreVerificado,
        rol: user?.rol || "Usuario",
        votos: nombreVerificado ? 0 : 1,
        fecha_sugerencia: new Date().toISOString(),
        usuario_id: user?.id || null,
        auditado: false,
      };

      if (indicePais > -1) {
        copiaNombresInternacionales[indicePais].nombres.push(nuevoNombreObj);
      } else {
        copiaNombresInternacionales.push({
          pais: sugerenciaForm.pais,
          nombres: [nuevoNombreObj],
        });
      }

      // Solo actualizamos "nombres_busqueda" si entró verificado (Staff)
      let actualizacionBusqueda = {};
      if (nombreVerificado) {
        const nuevaListaBusqueda = [
          ...new Set([
            ...(planta.nombres_busqueda || []),
            sugerenciaForm.texto,
          ]),
        ];
        actualizacionBusqueda = { nombres_busqueda: nuevaListaBusqueda };
      }

      // Guardar en BD
      const { error } = await plantaServices.actualizarPlanta(planta.id, {
        nombres_internacionales: copiaNombresInternacionales,
        ...actualizacionBusqueda,
      });

      if (error) throw error;

      // Actualizar UI
      setPlanta((prev) => ({
        ...prev,
        nombres_internacionales: copiaNombresInternacionales,
        ...(actualizacionBusqueda.nombres_busqueda
          ? { nombres_busqueda: actualizacionBusqueda.nombres_busqueda }
          : {}),
      }));
    } catch (error) {
      console.error("Error en la sugerencia:", error);
      alert("Error al procesar el nombre.");
    }
  };

  return (
    <div className="detalle-wrapper">
      <main className="main-block">
        {/* === SECCIÓN CARRUSEL === */}
        <section className="carrusel-panel">
          <CarruselPrincipal
            imagenes={imagenesCarrusel}
            key={categoriaActiva}
          />
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

        {/* === PANEL DERECHO: DNI DE LA PLANTA === */}
        <section className="info-panel">
          <div className="info-content-scroll">
            {/* 1. Header & Redes */}
            <div style={{ marginBottom: "20px" }}>
              <InfoHeader
                nombrePrincipal={
                  planta.nombres_busqueda?.[0] || planta.nombres?.[0]
                }
                nombreCientifico={planta.nombre_cientifico}
              />
              <InfoRedesSociales
                enlacesRedesSocialesJson={planta.enlaces_redes}
              />
            </div>

            {/* 2. Etiquetas */}
            <InfoEtiquetas listaEtiquetasBotanicas={planta.etiquetas_tags} />

            {/* 3. Panel Colaborativo de Nombres (Glassmorphism) */}
            <SeccionNombresColaborativa
              datosNombres={planta.nombres_internacionales}
              usuarioActual={user}
              onVotar={handleVotarNombre}
              onSugerir={handleSugerirNombre}
            />

            {/* 4. Acordeones Dinámicos */}
            <InfoAcordeones secciones={planta.secciones_info} />

            {/* 5. Acciones de Staff y Ubicación */}
            <div
              className="btn-container"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "30px",
              }}
            >
              <BotonPrincipal
                texto="AGREGAR UBICACIÓN"
                onClick={() =>
                  navigate("/registro", {
                    state: {
                      plantaId: planta.id,
                      nombres_planta: planta.nombres_busqueda || planta.nombres,
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
                          nombres_planta:
                            planta.nombres_busqueda || planta.nombres,
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
                          nombres_planta:
                            planta.nombres_busqueda || planta.nombres,
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

      {/* === BLOQUE INFERIOR: UBICACIONES === */}
      <section className="ubicaciones-block">
        <SeccionUbicaciones
          ubicaciones={planta.ubicaciones || []}
          nombrePlanta={planta.nombres_busqueda?.[0] || planta.nombres?.[0]}
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
