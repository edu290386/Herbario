import { useEffect, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { BotonVolver } from "../components/BotonVolver";
import { BotonRegistrar } from "../components/BotonRegistrar";
import { CarruselDetalle } from "../components/CarruselDetalle";
import { BloqueIdentidad } from "../components/BloqueIdentidad";
import { colores } from "../constants/tema";
import { SeccionInformacion } from "../components/SeccionInformacion";
import { SeccionUbicaciones } from "../components/SeccionUbicaciones";


export const DetallePage = () => {
  const { state } = useLocation();
  const planta = state?.planta;
  const navigate = useNavigate();

  const [ubicaciones, setUbicaciones] = useState([]);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(true);
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
        (error) => console.log("GPS denegado o no disponible"),
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
    if (planta?.id) {
      const fetchUbicaciones = async () => {
        try {
          const { data, error } = await supabase
            .from("ubicaciones")
            .select("*")
            .eq("planta_id", planta.id);
          if (error) throw error;
          setUbicaciones(data || []);
        } catch (error) {
          console.error("Error:", error.message);
        } finally {
          setCargandoUbicaciones(false);
        }
      };
      fetchUbicaciones();
    }
  }, [planta]);

  if (!planta) return <Navigate to="/" />;

  const fotosPlanta = [
    planta.foto_perfil,
    planta.foto_tallo,
    planta.foto_hoja,
    planta.foto_fruto,
    planta.foto_raiz,
    planta.foto_flor,
    planta.foto_semilla,
  ].filter(Boolean);

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
          <CarruselDetalle imagenes={fotosPlanta} isMobile={isMobile} />
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
          <BotonRegistrar
            texto="AGREGAR UBICACIÓN"
            onClick={() =>
              navigate("/registro", {
                state: {
                  plantaId: planta.id, // El ID para la base de datos
                  nombreComun: planta.nombre_comun, // Para mostrarlo en el título
                  vieneDeDetalle: true, // Para distinguir si es planta nueva o ya creada
                  nombresSecundarios: planta.nombres_secundarios,
                },
              })
            }
          />
        </div>
      </div>

      {/* BLOQUE 2: RESTO DEL CONTENIDO (Scroll) */}
      <SeccionUbicaciones
        ubicaciones={ubicaciones}
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

  
};