import React, { useState, useEffect, useRef } from "react";
import { colores } from "../constants/tema.js";
import { supabase } from "../supabaseClient";
import { obtenerDireccion } from "../helpers/geoHelper.js";

export const UbicacionInfo = ({
  idUbicacion,
  latitud,
  longitud,
  distrito,
  ciudad,
  colaborador,
  userCoords,
}) => {
  // 1. Estado inicial: Mostramos lo que ya existe en la DB o un indicador de carga
  const [lugar, setLugar] = useState({
    distrito: distrito || (latitud ? "Buscando..." : "Ubicación"),
    ciudad: ciudad || "",
  });

  // 2. Candado de seguridad para evitar múltiples llamadas a la API
  const apiLlamadaRef = useRef(false);

  useEffect(() => {
    // CASO A: Los datos ya existen en la Base de Datos
    if (distrito && ciudad) {
      setLugar({ distrito, ciudad });
      return;
    }

    // CASO B: No hay datos, pero tampoco hay coordenadas válidas aún (esperamos)
    if (!latitud || !longitud || latitud === "undefined") return;

    // CASO C: Tenemos coordenadas y los campos en la DB están vacíos
    if (!apiLlamadaRef.current) {
      apiLlamadaRef.current = true; // Cerramos el candado

      const completarUbicacion = async () => {
        try {
          // Añadimos un pequeño retraso aleatorio (entre 100ms y 1000ms)
          // para que las cards no disparen la API todas al mismo tiempo
          const delay = Math.floor(Math.random() * 900) + 100;
          await new Promise((resolve) => setTimeout(resolve, delay));

          const res = await obtenerDireccion(latitud, longitud);

          if (res) {
            setLugar(res);
            await supabase
              .from("ubicaciones")
              .update({ distrito: res.distrito, ciudad: res.ciudad })
              .eq("id", idUbicacion);
          } else {
            setLugar({ distrito: "Ubicación", ciudad: "Ver en mapa" });
          }
        } catch (err) {
          console.error("Error en flujo de UbicacionInfo:", err);
        }
      };

      completarUbicacion();
    }
  }, [idUbicacion, latitud, longitud, distrito, ciudad]);

  return (
    <div style={styles.container}>
      <h3 style={styles.distrito}>{lugar.distrito}</h3>

      <p style={styles.ciudad}>{lugar.ciudad}</p>

      <div style={styles.acreditacion}>
        <span style={styles.checkIcon}>✓</span>
        Ubicación verificada
      </div>

      <div style={styles.colaboradorWrapper}>
        <span style={styles.colaborador}>
          Aporte: <strong>{colaborador || "Admin"}</strong>
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
  checkIcon: {
    fontWeight: "bold",
    fontSize: "0.8rem",
  },
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
