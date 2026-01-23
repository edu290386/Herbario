import React, { useState, useEffect, useRef } from "react";
import { colores } from "../constants/tema.js";
import { supabase } from "../supabaseClient";
import { obtenerDireccion } from "../helpers/geoHelper.js";

export const UbicacionInfo = ({
  idUbicacion,
  latitud,
  longitud,
  distrito, // Columna de tu BD
  ciudad, // Columna de tu BD
  colaborador = "Admin",
}) => {
  // 1. Estado local para mostrar la info de inmediato
  const [lugar, setLugar] = useState({
    distrito: distrito || "Buscando...",
    ciudad: ciudad || "",
  });

  // 2. Candado para que la API se llame UNA sola vez
  const apiLlamadaRef = useRef(false);

  useEffect(() => {
    // Si ya existen datos en la base de datos, los ponemos en el estado y no hacemos nada más
    if (distrito && ciudad) {
      setLugar({ distrito, ciudad });
      return;
    }

    // Si NO existen datos y NO hemos llamado a la API todavía:
    if (!apiLlamadaRef.current) {
      apiLlamadaRef.current = true; // Cerramos el candado inmediatamente

      const completarUbicacion = async () => {
        try {
          const res = await obtenerDireccion(latitud, longitud);

          if (res) {
            setLugar(res);

            // ADMINISTRACIÓN: Guardamos en Supabase para que la próxima vez ya exista
            const { error } = await supabase
              .from("ubicaciones")
              .update({
                distrito: res.distrito,
                ciudad: res.ciudad,
              })
              .eq("id", idUbicacion);

            if (error)
              console.error("Error al auto-guardar ubicación:", error.message);
          }
        } catch (err) {
          console.error("Fallo en geocodificación:", err);
          setLugar({ distrito: "Ubicación", ciudad: "Sin datos de zona" });
        }
      };

      completarUbicacion();
    }
  }, [idUbicacion, latitud, longitud, distrito, ciudad]);

  return (
    <div style={styles.container}>
      {/* Información del Lugar */}
      <h3 style={styles.distrito}>{lugar.distrito}</h3>
      <p style={styles.ciudad}>{lugar.ciudad}</p>

      {/* Sello de Verificación */}
      <div style={styles.acreditacion}>
        <span style={styles.checkIcon}>✓</span>
        Ubicación verificada por administrador
      </div>

      {/* Información del Colaborador */}
      <div style={styles.colaboradorWrapper}>
        <span style={styles.colaborador}>
          Aporte: <strong>{colaborador}</strong>
        </span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    justifyContent: "center",
  },
  distrito: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: "700",
    color: colores.bosque,
    lineHeight: "1.2",
  },
  ciudad: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#666",
    fontWeight: "400",
  },
  acreditacion: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "0.72rem",
    color: colores.frondoso,
    marginTop: "4px",
    fontWeight: "500",
  },
  checkIcon: { fontWeight: "bold" },
  colaboradorWrapper: {
    marginTop: "8px",
    borderTop: `1px solid #f0f0f0`,
    paddingTop: "6px",
  },
  colaborador: {
    fontSize: "0.8rem",
    color: "#888",
    fontStyle: "italic",
  },
};
