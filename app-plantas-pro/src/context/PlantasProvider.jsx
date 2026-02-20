import { useReducer, useCallback, useMemo } from "react";
import { PlantasContext } from "./PlantasContext";
import { plantasReducer } from "./plantasReducer";
import { getPlantasBasico } from "../services/plantasServices";

const INITIAL_STATE = {
  plantas: [],
  cargando: false,
};

export const PlantasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(plantasReducer, INITIAL_STATE);

  const cargarPlantasHome = useCallback(
    async (force = false) => {
      // 🚩 SI YA HAY PLANTAS Y NO ESTAMOS FORZANDO, NO HACEMOS NADA
      if (state.plantas.length > 0 && !force) return;

      dispatch({ type: "[Plantas] - Set Cargando" });
      try {
        const data = await getPlantasBasico();
        dispatch({
          type: "[Plantas] - Cargar Basico",
          payload: data || [],
        });
      } catch (error) {
        console.error("Error cargando plantas:", error);
        dispatch({ type: "[Plantas] - Cargar Basico", payload: [] });
      }
    },
    [state.plantas.length],
  ); // Escucha si el tamaño de la lista cambia

  const plantasValue = useMemo(
    () => ({
      ...state,
      cargarPlantasHome,
    }),
    [state, cargarPlantasHome],
  );

  return (
    <PlantasContext.Provider value={plantasValue}>
      {children}
    </PlantasContext.Provider>
  );
};
