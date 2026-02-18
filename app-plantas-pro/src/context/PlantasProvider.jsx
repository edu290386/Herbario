import { useReducer, useCallback, useMemo } from "react"; // Añadido useMemo
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
    if (state.plantas.length > 0) return;
    dispatch({ type: "[Plantas] - Set Cargando" });
    try {
      const data = await getPlantasBasico();
      dispatch({
        type: "[Plantas] - Cargar Basico",
        payload: data || [],
      });
    } catch (error) {
      console.error("Error al cargar plantas:", error);
      dispatch({
        type: "[Plantas] - Cargar Basico",
        payload: [],
      });
    }
  }, [state.plantas.length]);

  const agregarPlantaLocal = useCallback((nuevaPlanta) => {
    dispatch({
      type: "[Plantas] - Agregar Nueva",
      payload: nuevaPlanta,
    });
  }, []);

  const agregarUbicacionAlEstado = useCallback((plantaId, nuevaUbi) => {
    dispatch({
      type: "[Plantas] - Actualizar Ubicaciones",
      payload: { plantaId, nuevaUbi },
    });
  }, []);

  const actualizarPlantasTrasRegistro = useCallback((plantaProcesada) => {
    dispatch({
      type: "[Plantas] - Actualizar o Insertar",
      payload: plantaProcesada,
    });
  }, []);

  // ✅ ESTO DETIENE EL DESMONTAJE DEL GPS
  // Memorizamos todo el objeto. Si 'state' no cambia, el objeto es el mismo.
  // Así, AppRouter no detecta cambios falsos y no reinicia la página de registro.
  const plantasValue = useMemo(
    () => ({
      ...state,
      cargarPlantasHome,
      agregarPlantaLocal,
      agregarUbicacionAlEstado,
      actualizarPlantasTrasRegistro,
    }),
    [
      state,
      cargarPlantasHome,
      agregarPlantaLocal,
      agregarUbicacionAlEstado,
      actualizarPlantasTrasRegistro,
    ],
  );

  return (
    <PlantasContext.Provider value={plantasValue}>
      {children}
    </PlantasContext.Provider>
  );
};
