import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  BotonVolver,
  BotonPrincipal,
  SeccionInformacion,
  BloqueIdentidad,
  CarruselDetalle,
  SeccionUbicaciones,
} from "../components";
import { colores } from "../constants/tema";
import { FaSpinner } from "react-icons/fa6";
import { AuthContext } from "../context/AuthContext";


export const DetallePage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  console.log(user);
  const navigate = useNavigate();

  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    // Capturamos el GPS del usuario (solo una vez al cargar la página)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => console.log(error),
        { enableHighAccuracy: true },
      );
    }
  }, []);

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

        // ⏳ Definimos un tiempo mínimo de 2 segundos para el spinner
        const tiempoMinimo = new Promise((resolve) =>
          setTimeout(resolve, 2000),
        );

        // 🔍 Consulta a la base de datos con las relaciones explícitas que definimos
        const consultaSupabase = supabase
          .from("plantas")
          .select(
            `
            *,
            ubicaciones!fk_ubicacion_planta (
              *,
              usuarios!ubicaciones_usuario_id_fkey (
                nombre_completo
              )
            )
          `,
          )
          .eq("id", id)
          .single();

        // Esperamos a que ambas promesas terminen
        const [_, result] = await Promise.all([tiempoMinimo, consultaSupabase]);

        if (result.error) throw result.error;
        setPlanta(result.data);
      } catch (error) {
        console.error("Error cargando planta:", error.message);
        // Si hay error (ej. planta no existe), volvemos al inicio
        // navigate("/");
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
        <FaSpinner style={styles.spinner} />
      </div>
    );
  }

  // Si no hay planta después de cargar, no renderizamos nada (o un error)
  if (!planta) return null;

  // PREPARACIÓN DE FOTOS PARA EL CARRUSEL
  const fotosPlanta = [
    planta.foto_perfil,
    planta.foto_tallo,
    planta.foto_hoja,
    planta.foto_fruto,
    planta.foto_raiz,
    planta.foto_flor,
    planta.foto_semilla,
  ].filter(Boolean);

  const imagenesCarrusel = fotosPlanta.length > 0 ? fotosPlanta : [null];

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
        ubicaciones={planta.ubicaciones}
        nombrePlanta={planta.nombre_comun}
        isMobile={isMobile}
        userCoords={userCoords}
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
    fontSize: "4rem",
    animation: "spin 2s linear infinite",
    color: colores.frondoso,
  },
};

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`,
  styleSheet.cssRules.length,
);