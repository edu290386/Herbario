import { AcordeonInformacion } from "./AcordeonInformacion.jsx";

export const SeccionInformacion = ({ planta }) => {
  // Si no hay planta, no renderizamos nada
  if (!planta.acordeon1 && !planta.acordeon2) return null;
  
  return (
    <div style={styles.contenedor}>
      {/* Solo renderizamos lo que realmente existe en tu BD: contenido1, 2, etc. */}
      <div style={styles.acordeonesContainer}>
        {planta.acordeon1 && (
          <AcordeonInformacion
            titulo="Propiedades Medicinales"
            contenido={planta.acordeon1}
          />
        )}
        {planta.acordeon2 && (
          <AcordeonInformacion
            titulo="Usos"
            contenido={planta.acordeon2}
          />
        )}
        <AcordeonInformacion
          titulo="Links externos"
          contenido={<p style={styles.textInterno}></p>}
        />
      </div>
    </div>
  );
};

const styles = {
  contenedor: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "0px",
    marginBottom: "15px",
    width: "100%"
  },
  acordeonesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
};