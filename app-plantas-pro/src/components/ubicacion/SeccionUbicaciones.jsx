import { CardUbicacion } from "./CardUbicacion";
import { colores } from "../../constants/tema";
import { StatusBanner } from "../ui/StatusBanner";
import { TbReload } from "react-icons/tb";
import { procesarUbicacionesConGPS } from "../../helpers/geoHelper";

export const SeccionUbicaciones = ({
  ubicaciones,
  nombrePlanta,
  isMobile,
  userCoords,
  onEliminar,
  errorGPS,
  refrescarGPS,
  userPhone,
}) => {
 
  const { ubicacionesProcesadas, statusGps, mensajeGps, hayErrorReal } =
    procesarUbicacionesConGPS(ubicaciones, userCoords, errorGPS);

  return (
    <div style={isMobile ? styles.containerMobile : styles.containerLaptop}>
      {/* HEADER: Título y contador */}
      <div style={styles.header}>
        <h2 style={styles.titulo}>
          Ubicaciones registradas para {nombrePlanta}
        </h2>
        <div style={styles.contenedorSeccion}>
          {/* Banner con inteligencia de distancia (se pone rojo si detecta error de laptop) */}
          <StatusBanner status={statusGps} message={mensajeGps} />

          {/* Botón de reinicio: Se muestra si hay error real, señal inestable o falta el GPS */}
          {(hayErrorReal || !userCoords) && (
            <button onClick={refrescarGPS} style={styles.botonReiniciarGlobal}>
              <TbReload size={20} />
              <span>Reiniciar GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* GRID DINÁMICO: 1 col en mobile, 2 en laptop */}
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "5px" : "20px",
        }}
      >
        {ubicacionesProcesadas.length > 0 ? (
          ubicacionesProcesadas.map((ubi) => (
            <CardUbicacion
              key={ubi.id}
              ubicacion={ubi}
              distanciaTexto={ubi.distanciaTexto}
              esReal={ubi.esReal}
              isMobile={isMobile}
              onEliminar={onEliminar}
              nombrePlanta={nombrePlanta}
              userPhone={userPhone}
            />
          ))
        ) : (
          <p style={styles.sinDatos}>
            Aún no hay ubicaciones para esta planta.
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  containerLaptop: {
    width: "100%",
    maxWidth: "1200px", // Aumentado para dar aire a las 2 columnas
    margin: "0px auto",
    padding: "20px",
    backgroundColor: "transparent",
    boxSizing: "border-box",
  },
  containerMobile: {
    width: "100%",
    padding: "0px", // 0 a los lados para que el grid controle el margen real
    margin: "0px",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems:"center",
    textAlign: "center",
    marginBottom: "25px",
  },
  titulo: {
    fontSize: "1.4rem",
    color: colores.bosque,
    marginBottom: "30px",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    width: "100%",
    margin: "0px auto", // Centrado matemático
    padding: "10px 6px 0px 5px", // Este es el único margen lateral que debe existir
    boxSizing: "border-box",
    // justifyItems: "stretch" asegura que el card intente ocupar todo el ancho
    justifyItems: "stretch",
  },
  sinDatos: {
    gridColumn: "1 / -1", // Hace que el mensaje ocupe todo el ancho del grid
    textAlign: "center",
    color: "#888",
    padding: "40px",
    fontStyle: "italic",
  },
  contenedorSeccion: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "335px",
    gap: "10px", // Espacio entre Banner, Botón y Grilla
  },
  botonReiniciarGlobal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "335px", // Para que no sea gigante en desktop
    padding: "12px 0px",
    backgroundColor: "#fff",
    color: "#d32f2f", // Rojo suave
    border: "2px solid #feb2b2",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "1rem",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    transition: "transform 0.2s active",
  },
};
