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

  const cargarPlantasHome = useCallback(async () => {
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
  }, []);

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
