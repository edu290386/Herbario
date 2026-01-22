import React, { useState } from "react";
import { CardUbicacion } from "./CardUbicacion";
import { colores } from "./texthelper.js";

export const SeccionUbicaciones = ({
  ubicaciones,
  usuarioActual,
  plantaNombre,
}) => {
  const [filtro, setFiltro] = useState("grupo"); // Acuerdo: 'grupo' por defecto

  // Filtrar la data según el acuerdo
  const dataFiltrada = ubicaciones.filter((u) =>
    filtro === "propias" ? u.usuario_id === usuarioActual.id : true,
  );

  return (
    <div style={styles.contenedor}>
      {/* Switch de Filtro (Acuerdo: Propias vs Grupo) */}
      <div style={styles.headerSeccion}>
        <h2 style={{ color: colores.bosque }}>Ubicaciones de {plantaNombre}</h2>
        <div style={styles.toggleContainer}>
          <button
            onClick={() => setFiltro("grupo")}
            style={{
              ...styles.btnFiltro,
              fontWeight: filtro === "grupo" ? "bold" : "normal",
            }}
          >
            Grupo
          </button>
          <button
            onClick={() => setFiltro("propias")}
            style={{
              ...styles.btnFiltro,
              fontWeight: filtro === "propias" ? "bold" : "normal",
            }}
          >
            Mías
          </button>
        </div>
      </div>

      {/* Listado de Cards */}
      {dataFiltrada.length > 0 ? (
        dataFiltrada.map((ubicacion) => (
          <CardUbicacion
            key={ubicacion.id}
            data={ubicacion}
            usuarioActual={usuarioActual}
            alBorrar={(id) => console.log("Borrando...", id)} // Aquí conectas tu función de Supabase
          />
        ))
      ) : (
        <p style={styles.vacio}>No hay ubicaciones registradas aún.</p>
      )}
    </div>
  );
};

const styles = {
  contenedor: { padding: "20px 0" },
  headerSeccion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  toggleContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: "20px",
    padding: "4px",
  },
  btnFiltro: {
    border: "none",
    background: "none",
    padding: "5px 15px",
    cursor: "pointer",
  },
  vacio: { textAlign: "center", color: "#888", fontStyle: "italic" },
};
