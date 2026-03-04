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
import { FichaInteractiva } from "../../components/planta/FichaInteractiva.jsx";
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
  const handleVotarNombre = async (codigoPais, nombreTexto, tipoVoto) => {
    const userId = user.id; // El ID del usuario actual

    try {
      const copiaNombres = [...(planta.nombres_internacionales || [])];
      const bloque = copiaNombres.find((p) => p.pais === codigoPais);
      const nombreObj = bloque.nombres.find((n) => n.texto === nombreTexto);

      // Inicializamos los arrays si no existen (para evitar errores)
      if (!nombreObj.votos_usuarios) nombreObj.votos_usuarios = [];
      if (!nombreObj.dislikes_usuarios) nombreObj.dislikes_usuarios = [];

      // 🚩 VALIDACIÓN: ¿Ya votó?
      const yaVotoLike = nombreObj.votos_usuarios.includes(userId);
      const yaVotoDislike = nombreObj.dislikes_usuarios.includes(userId);

      if (tipoVoto === "like") {
        if (yaVotoLike) return; // Si ya dio like, salimos (no hace nada)
        nombreObj.votos_usuarios.push(userId); // Agregamos su ID
        // Si antes tenía dislike, se lo quitamos (opcional, para limpieza)
        nombreObj.dislikes_usuarios = nombreObj.dislikes_usuarios.filter(
          (id) => id !== userId,
        );
      } else {
        if (yaVotoDislike) return; // Si ya dio dislike, salimos
        nombreObj.dislikes_usuarios.push(userId); // Agregamos su ID
        nombreObj.votos_usuarios = nombreObj.votos_usuarios.filter(
          (id) => id !== userId,
        );
      }

      // Calculamos los totales basados en el tamaño de los arrays
      const totalLikes = nombreObj.votos_usuarios.length;
      const totalDislikes = nombreObj.dislikes_usuarios.length;

      // Lógica de "Corte"
      let updateBusqueda = {};
      if (totalLikes >= 5 || (tipoVoto === "like" && esStaff)) {
        nombreObj.verificado = true;
        const nuevaLista = [
          ...new Set([...(planta.nombres_busqueda || []), nombreTexto]),
        ];
        updateBusqueda = { nombres_busqueda: nuevaLista };
      } else if (totalDislikes >= 5 || (tipoVoto === "dislike" && esStaff)) {
        nombreObj.rechazado = true;
      }

      // Guardar y Actualizar UI (Igual que antes...)
      await plantaServices.actualizarPlanta(planta.id, {
        nombres_internacionales: copiaNombres,
        ...updateBusqueda,
      });
      setPlanta((prev) => ({
        ...prev,
        nombres_internacionales: copiaNombres,
        ...updateBusqueda,
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

      // NUEVO CONTRATO DE DATOS (REEMPLAZA TU BLOQUE ANTERIOR)
      const nuevoNombreObj = {
        texto: sugerenciaForm.texto,
        verificado: esStaff,
        rechazado: false,
        auditado: false,
        usuario_id: user?.id || null,
        nombre_autor: `${user?.nombre || "Usuario"} ${user?.apellido || ""}`,
        rol_creador: user?.rol || "Usuario",
        fecha_sugerencia: new Date().toISOString(),
        votos_usuarios: esStaff ? [] : [user?.id], // Si es staff no necesita votos, si es user empieza con el suyo
        dislikes_usuarios: [],
      };

      if (indicePais > -1) {
        copiaNombresInternacionales[indicePais].nombres.push(nuevoNombreObj);
      } else {
        copiaNombresInternacionales.push({
          pais: sugerenciaForm.pais,
          nombres: [nuevoNombreObj],
        });
      }

      // ... lógica de actualización de búsqueda (se mantiene igual)
      let actualizacionBusqueda = {};
      if (esStaff) {
        const nuevaListaBusqueda = [
          ...new Set([
            ...(planta.nombres_busqueda || []),
            sugerenciaForm.texto,
          ]),
        ];
        actualizacionBusqueda = { nombres_busqueda: nuevaListaBusqueda };
      }

      await plantaServices.actualizarPlanta(planta.id, {
        nombres_internacionales: copiaNombresInternacionales,
        ...actualizacionBusqueda,
      });

      setPlanta((prev) => ({
        ...prev,
        nombres_internacionales: copiaNombresInternacionales,
        ...actualizacionBusqueda,
      }));
    } catch (error) {
      console.error("Error:", error);
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
          <div style={{ padding: "0 20px", marginTop: "-5px" }}>
            <InfoEtiquetas listaEtiquetasBotanicas={planta.etiquetas_tags} />
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
            </div>          
            <FichaInteractiva
              planta={planta}
              usuarioActual={user}
              onVotar={handleVotarNombre}
              onSugerir={handleSugerirNombre}
            />

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
