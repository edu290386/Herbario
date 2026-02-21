import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Ajusta la ruta a tu cliente de BD

export const useUbicacionesPlanta = (plantaId) => {
  const [coordsExistentes, setCoordsExistentes] = useState([]);
  const [cargandoCoords, setCargandoCoords] = useState(true);

  useEffect(() => {
    // Si no hay ID de planta, no buscamos nada
    if (!plantaId) {
      setCargandoCoords(false);
      return;
    }

    const obtenerCoordenadas = async () => {
      setCargandoCoords(true);
      try {
        // Traemos SOLO latitud y longitud de las ubicaciones de ESTA planta
        const { data, error } = await supabase
          .from("ubicaciones")
          .select("latitud, longitud")
          .eq("planta_id", plantaId);

        if (error) throw error;
        setCoordsExistentes(data || []);
      } catch (error) {
        console.error("Error al obtener coordenadas:", error.message);
      } finally {
        setCargandoCoords(false);
      }
    };

    obtenerCoordenadas();
  }, [plantaId]);

  return { coordsExistentes, cargandoCoords };
};
