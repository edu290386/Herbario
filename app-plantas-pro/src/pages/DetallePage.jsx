import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { transformarImagen } from '../helpers/cloudinaryHelper';
import { BotonVolver } from '../components/BotonVolver';

export const DetallePage = () => {
    const { id: nombreUrl } = useParams();
    console.log(nombreUrl)
    const location = useLocation();
    const navigate = useNavigate();

    const planta = location.state?.planta;
    const [ubicaciones, setUbicaciones] = useState([]);
    const [cargandoUbicaciones, setCargandoUbicaciones] = useState(true);

    useEffect(() => {
        if (planta) {
            fetchUbicaciones(planta.id);
        }
    }, [planta]);

    const fetchUbicaciones = async (plantaId) => {
        try {
            const { data, error } = await supabase
                .from('ubicaciones')
                .select('*')
                .eq('planta_id', plantaId);
            
            if (error) throw error;
            setUbicaciones(data || []);
        } catch (error) {
            console.error("Error:", error.message);
        } finally {
            setCargandoUbicaciones(false);
        }
    };

    if (!planta) return <Navigate to="/" />;

    return (
      <div style={styles.wrapper}>
        {/* SECCIÓN VISUAL (9:16) */}
        <div style={styles.header}>
          <BotonVolver />
          <img
            src={transformarImagen(planta.foto_perfil, "detalle")}
            alt={planta.nombre_comun}
            style={styles.imgHero}
          />
        </div>

        {/* SECCIÓN INFORMACIÓN */}
        <div style={styles.content}>
          <h1 style={styles.title}>{planta.nombre_comun}</h1>
          <p style={styles.scientificName}>{planta.nombre_cientifico}</p>

          <div style={styles.section}>
            <h3 style={styles.subTitle}>Propiedades Medicinales</h3>
            <p style={styles.text}>{planta.descripcion_medicinal}</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.subTitle}>Ubicaciones Registradas</h3>
            {cargandoUbicaciones ? (
              <p style={styles.text}>Buscando coordenadas...</p>
            ) : (
              <div style={styles.list}>
                {ubicaciones.map((u) => (
                  <div key={u.id} style={styles.locationItem}>
                    📍 Lat: {u.latitud} | Lon: {u.longitud}
                  </div>
                ))}
                {ubicaciones.length === 0 && (
                  <p style={styles.text}>Sin registros aún.</p>
                )}
              </div>
            )}
          </div>

          <button style={styles.btnGPS}>REGISTRAR MI UBICACIÓN</button>
        </div>
      </div>
    );
};

// --- CONSTANTES DE ESTILO (Estética de la App) ---
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    height: "60vh",
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  imgHero: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  btnBack: {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "10px 18px",
    backgroundColor: "#F4E285",
    color: "#2F4538",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  content: {
    padding: "30px 25px",
    marginTop: "-35px",
    backgroundColor: "#fff",
    borderRadius: "35px 35px 0 0",
    boxShadow: "0 -10px 20px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "2rem",
    margin: "0 0 5px 0",
    color: "#1a1a1a",
  },
  scientificName: {
    fontSize: "1.1rem",
    fontStyle: "italic",
    color: "#2D5A27", // Verde institucional
    marginBottom: "25px",
  },
  section: {
    marginBottom: "20px",
  },
  subTitle: {
    fontSize: "1.2rem",
    borderBottom: "2px solid #f0f4f0",
    paddingBottom: "8px",
    marginBottom: "10px",
    color: "#333",
  },
  text: {
    lineHeight: "1.6",
    color: "#555",
    fontSize: "0.95rem",
  },
  locationItem: {
    backgroundColor: "#f9f9f9",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "8px",
    fontSize: "0.85rem",
    border: "1px solid #eee",
    color: "#666",
  },
  btnGPS: {
    width: "100%",
    padding: "18px",
    backgroundColor: "#2D5A27", // Mismo verde del nombre científico
    color: "#fff",
    border: "none",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "1rem",
    marginTop: "20px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(45, 90, 39, 0.2)",
  },
};