import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { BotonVolver } from "../components/BotonVolver";
import { BotonRegistrar } from "../components/BotonRegistrar";
import { CarruselDetalle } from "../components/CarruselDetalle";
import { IoMdLocate, IoMdRemove } from "react-icons/io";
import { OtrosNombres } from "../components/OtrosNombres";
import { AcordeonInformacion } from "../components/AcordeonInformacion"

export const DetallePage = () => {
  const { state } = useLocation();
  const planta = state?.planta;

  const [ubicaciones, setUbicaciones] = useState([]);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [acordeonAbierto, setAcordeonAbierto] = useState(false);

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
    if (planta) {
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
          {/* 1. Nombre Común */}
          <h1 style={styles.title}>{planta.nombre_comun}</h1>

          {/* 2. Nombre Científico */}
          <p style={styles.scientificName}>{planta.nombre_cientifico}</p>

          {/* 3. REUTILIZACIÓN: Componente OtrosNombres */}
          {/* Pasamos los datos de la planta como prop según lo tengas definido */}
          <OtrosNombres planta={planta} />

          {/* 4. Acordeón de Usos (Lógica local para el despliegue) */}
          <div style={styles.accordionContainer}>
            <div
              style={styles.accordionHeader}
              onClick={() => setAcordeonAbierto(!acordeonAbierto)}
            >
              <h3
                style={{
                  ...styles.subTitle,
                  marginBottom: 0,
                  borderBottom: "none",
                }}
              >
                Usos y Propiedades
              </h3>
              <span style={styles.arrowIcon}>
                {acordeonAbierto ? "▲" : "▼"}
              </span>
            </div>

            {acordeonAbierto && (
              <div style={styles.accordionContent}>
                <p style={styles.text}>{planta.usos}</p>
              </div>
            )}
          </div>

          {/* 5. REUTILIZACIÓN: Componente BotonRegistrar */}
          {/* El texto "REGISTRAR NUEVA UBICACIÓN" se gestiona dentro del componente o vía props */}
          <BotonRegistrar />
        </div>
      </div>

      {/* BLOQUE 2: RESTO DEL CONTENIDO (Scroll) */}
      <div style={styles.scrollSection}>
        {isMobile && (
          <div style={styles.mobileDescription}>
            <h3 style={styles.subTitle}>Propiedades Medicinales</h3>
            <p style={styles.text}>{planta.descripcion_medicinal}</p>
            <BotonRegistrar />
          </div>
        )}

        <div style={styles.ubicacionesContainer}>
          <h3 style={styles.subTitle}>Ubicaciones Registradas</h3>
          {cargandoUbicaciones ? (
            <p style={styles.text}>Cargando coordenadas...</p>
          ) : (
            <div style={styles.list}>
              {ubicaciones.map((u) => (
                <div key={u.id} style={styles.locationItem}>
                  <div style={styles.locationMain}>
                    <IoMdLocate size={20} color="#2D5A27" />
                    <span style={styles.coordText}>
                      Lat: {u.latitud.toFixed(4)}
                    </span>
                    <IoMdRemove color="#ccc" />
                    <span style={styles.coordText}>
                      Lon: {u.longitud.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
              {ubicaciones.length === 0 && (
                <p style={styles.text}>Sin registros aún.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};;;

const styles = {
  wrapper: {
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
  },
  mainContainer: {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
  },
  carruselSection: {
    flex: 1.2,
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column", // Para que miniaturas y principal se alineen bien
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    flex: 1,
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "2.5rem",
    margin: "0 0 10px 0",
    color: "#1a1a1a",
  },
  scientificName: {
    fontSize: "1.3rem",
    fontStyle: "italic",
    color: "#2D5A27",
    marginBottom: "20px",
  },
  desktopDescription: {
    marginTop: "20px",
  },
  scrollSection: {
    padding: "40px 25px",
    backgroundColor: "#fff",
  },
  mobileDescription: {
    marginBottom: "40px",
  },
  subTitle: {
    fontSize: "1.2rem",
    borderBottom: "2px solid #f0f4f0",
    paddingBottom: "8px",
    marginBottom: "20px",
    color: "#333",
  },
  text: {
    lineHeight: "1.6",
    color: "#555",
    fontSize: "1rem",
    marginBottom: "30px",
  },
  ubicacionesContainer: {
    marginTop: "20px",
  },
  locationItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "10px",
    border: "1px solid #eee",
  },
  locationMain: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  coordText: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "500",
  },
};
