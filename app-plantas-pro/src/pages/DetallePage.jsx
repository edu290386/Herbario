import { useEffect, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { BotonVolver } from "../components/BotonVolver";
import { BotonRegistrar } from "../components/BotonRegistrar";
import { CarruselDetalle } from "../components/CarruselDetalle";
import { AcordeonInformacion } from "../components/AcordeonInformacion"
import { BloqueIdentidad } from "../components/BloqueIdentidad";
import { CardUbicacion } from "../components/CardUbicación";
import { colores } from "../constants/tema";
import { SeccionInformacion } from "../components/SeccionInformacion";


export const DetallePage = () => {
  const { state } = useLocation();
  const planta = state?.planta;
  const navigate = useNavigate();

  const [ubicaciones, setUbicaciones] = useState([]);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
      <section style={styles.ListaUbicaciones}>
        {/* Card de Título y Conteo */}
        <div style={styles.cardHeaderUbicaciones}>
          <h2 style={styles.tituloHeader}>
            Ubicaciones registradas para:{" "}
            <span style={{ color: colores.bosque }}>{planta.nombre_comun}</span>
          </h2>
          <div style={styles.badgeConteo}>
            {ubicaciones.length}{" "}
            {ubicaciones.length === 1 ? "registro encontrado" : "registros encontrados"}
          </div>
        </div>

        {/* Listado de Cards */}
        <div style={styles.gridUbicaciones}>
          {ubicaciones.length > 0 ? (
            ubicaciones.map((item) => (
              <CardUbicacion key={item.id} data={item} />
            ))
          ) : (
            <div style={styles.cardVacia}>
              <p>No hay ubicaciones registradas aún.</p>
            </div>
          )}
        </div>
      </section>
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
    minHeight: "100vh",
  },
  carruselSection: {
    flex: 1.2,
    backgroundColor: colores.fondo,
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
    backgroundColor: colores.fondo,
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

  ListaUbicaciones: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "650px", // Alineado al maxWidth de la CardUbicacion
    margin: "0 auto", // Centra todo el bloque 2
    padding: "30px 0",
    overflowY: "visible",
  },

  cardHeaderUbicaciones: {
    backgroundColor: "#fff",
    padding: "25px 20px",
    borderRadius: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "10px",
    textAlign: "center", // CENTRA EL TEXTO
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // CENTRA EL CONTENIDO (H2 y Badge)
    justifyContent: "center",
    gap: "12px",
    border: "1px solid #eee",
    width: "92%", // IGUAL QUE LA CARD EN MOVIL
    margin: "0 auto 15px auto", // CENTRA LA CARD Y DA MARGEN ABAJO
  },

  tituloHeader: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#333",
    fontWeight: "600",
    lineHeight: "1.4",
  },

  badgeConteo: {
    backgroundColor: colores.bosque || "#2d5a27",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  gridUbicaciones: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    // Las cards ya tienen su margin: "10px auto" y width: "92%"
  },

  cardVacia: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    textAlign: "center",
    color: "#999",
    border: "1px dashed #ccc",
    width: "92%",
    margin: "0 auto",
  },
};
