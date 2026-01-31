import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BotonVolver,
  BotonPrincipal,
  SeccionInformacion,
  BloqueIdentidad,
  CarruselDetalle,
  SeccionUbicaciones,
} from "../components";
import { colores } from "../constants/tema";
import { getDetallePlanta, deleteUbicacion } from "../services/plantasServices";
import { TbCloverFilled, TbReload } from "react-icons/tb";
import { AuthContext } from "../context/AuthContext.jsx";
import { useGPS } from "../hooks/useGPS.js"


export const DetallePage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { userCoords, errorGPS, refrescarGPS } = useGPS();

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

  // Listener para actualizar el diseño si cambian el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        const consultaSupabase = getDetallePlanta(id);
        // Esperamos a que ambas promesas terminen
        const [_, result] = await Promise.all([tiempoMinimo, consultaSupabase]);
        setPlanta(result);
      } catch (error) {
        console.error("Error cargando planta:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDatosCompletos();
  }, [id]);

  // --- RENDERIZADO DE CARGA ---
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <TbCloverFilled style={styles.spinner} />
      </div>
    );
  }

  // Si no hay planta después de cargar, no renderizamos nada (o un error)
  if (!planta) return null;

  // PREPARACIÓN DE FOTOS PARA EL CARRUSEL
const categorias = ["perfil", "tallo", "hoja", "fruto", "raiz", "flor", "semilla"];

// Mapeamos para obtener el valor de cada campo y filtramos los que no tienen URL
const imagenesCarrusel = categorias
  .map((cat) => planta[`foto_${cat}`])
  .filter(Boolean);

// Si el array queda vacío, le ponemos null para que el carrusel sepa qué hacer
if (imagenesCarrusel.length === 0) imagenesCarrusel.push(null);

  const manejarEliminarUbicacion = async (idUbi) => {
    if (!user) {
      alert("Debes estar logueado para eliminar.");
      return;
    }

    try {
      // 1. Llamamos al servicio (pasando ID de ubicación y ID del usuario logueado)
      await deleteUbicacion(idUbi, user.id);

      // 2. Filtramos el estado local // Como 'planta' tiene una lista de 'ubicaciones', creamos un nuevo objeto
      setPlanta((prevPlanta) => ({
        ...prevPlanta,
        ubicaciones: prevPlanta.ubicaciones.filter((u) => u.id !== idUbi),
      }));
    } catch (error) {
      alert("No se pudo eliminar la ubicación: " + error.message);
    }
  };

  const ubicacionesPermitidas = planta.ubicaciones.filter((u) => {
    const esMia = String(u.usuario_id) === String(user?.id);
    const nombreGrupoUbi = u.usuarios?.grupos?.nombre_grupo;
    const miNombreGrupo = user?.grupos?.nombre_grupo; 
    const esDeMiGrupo =
      nombreGrupoUbi && miNombreGrupo && nombreGrupoUbi === miNombreGrupo;
    return esMia || esDeMiGrupo;
  });

  return (
    <div style={styles.wrapper}>
      <BotonVolver />
      {/* BLOQUE 1: VISTA PRINCIPAL (100vh) */}
      <div
        style={{
          ...styles.mainContainer,
          flexDirection: isMobile ? "column" : "row",
          height: isMobile ? "auto" : "100vh",
          minHeight: isMobile ? "100vh" : "auto",
        }}
      >
        {/* LADO IZQUIERDO: Carrusel */}
        <div
          style={{
            ...styles.carruselSection,
            height: isMobile ? "60vh" : "100%",
            padding: isMobile ? "0" : "30px",
          }}
        >
          <CarruselDetalle imagenes={imagenesCarrusel} isMobile={isMobile} />
        </div>
        {/* LADO DERECHO: Info Principal */}
        <div
          style={{
            ...styles.infoSection,
            justifyContent: "flex-start",
            minHeight: isMobile ? "auto" : "100%",
          }}
        >
          <BloqueIdentidad planta={planta} />

          {/* 4. Acordeón de Usos (Lógica local para el despliegue) */}
          {/* Acordeón 1: Usando el campo 'contenido1' */}

          <SeccionInformacion planta={planta} />
          <BotonPrincipal
            texto="AGREGAR UBICACIÓN"
            onClick={() =>
              navigate("/registro", {
                state: {
                  plantaId: planta.id,
                  nombreComun: planta.nombre_comun,
                  nombreCientifico: planta.nombre_cientifico,
                  nombresSecundarios: planta.nombres_secundarios,
                  fotosPrevia: imagenesCarrusel,
                  vieneDeDetalle: true,
                },
              })
            }
          />
        </div>
      </div>

      {/* BLOQUE 2: RESTO DEL CONTENIDO (Scroll) */}
      <SeccionUbicaciones
        ubicaciones={ubicacionesPermitidas}
        nombrePlanta={planta.nombre_comun}
        isMobile={isMobile}
        userCoords={userCoords}
        onEliminar={manejarEliminarUbicacion}
        errorGPS={errorGPS}
        refrescarGPS={refrescarGPS}
        userPhone={user?.telefono}
      />
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: colores.fondo,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
  },
  mainContainer: {
    display: "flex",
    width: "100%",
  },
  carruselSection: {
    flex: 1.2,
    backgroundColor: colores.fondo,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: colores.fondo,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: colores.fondo, // colores.fondo
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  spinner: {
    fontSize: "8rem",
    animation: "spin 2s linear infinite",
    color: colores.frondoso,
  },
  reloadIcon: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.9rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  containerReloadIcon: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    marginBottom: "10px",
  },
};