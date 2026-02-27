import { AcordeonInformacion } from "./AcordeonInformacion.jsx";

export const SeccionInformacion = ({ planta }) => {
  // Si no hay planta, no renderizamos nada
 const { acordeon1, acordeon2 } = planta;

 // Si no hay contenido en ninguno, no ocupamos espacio en el layout
 if (!acordeon1 && !acordeon2) return null;

 return (
   <div style={styles.contenedor}>
     <div style={styles.acordeonesContainer}>
       {/* Acordeón 1: Medicinal */}
       {acordeon1 && (
         <AcordeonInformacion
           titulo="Propiedades Medicinales"
           contenido={acordeon1}
         />
       )}

       {/* Acordeón 2: Usos */}
       {acordeon2 && (
         <AcordeonInformacion titulo="Usos" contenido={acordeon2} />
       )}

       {/* Links Externos: Solo si existen en tu BD */}
       {<AcordeonInformacion titulo="Links externos" contenido={acordeon2} />}
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