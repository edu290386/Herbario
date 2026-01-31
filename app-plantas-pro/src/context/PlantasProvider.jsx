import { useReducer, useCallback, useEffect } from "react";
import { PlantasContext } from "./PlantasContext";
import { plantasReducer } from "./plantasReducer";
import { getPlantasBasico } from "../services/plantasServices";

const INITIAL_STATE = {
  plantas: [],
  cargando: false,
};

export const PlantasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(plantasReducer, INITIAL_STATE);

  /* Carga las plantas para la HomePage. Si ya existen plantas en el estado global, no realiza la petición a Supabase. */


 const cargarPlantasHome = useCallback(async () => {
   //  Si ya hay plantas, salimos.
   if (state.plantas.length > 0) return;

   dispatch({ type: "[Plantas] - Set Cargando" });

   try {
     const data = await getPlantasBasico();

     // Si todo sale bien, cargamos los datos (el reducer pone cargando: false)
     dispatch({
       type: "[Plantas] - Cargar Basico",
       payload: data || [],
     });
   } catch (error) {
     console.error("Error al cargar plantas:", error);

     // ¡IMPORTANTE! Si falla, forzamos el fin del cargando con un array vacío
     dispatch({
       type: "[Plantas] - Cargar Basico",
       payload: [],
     });
   }
   // Eliminamos state.plantas de la dependencia para evitar bucles innecesarios
 }, [state.plantas]);
  
 
 /* Agrega una planta recién creada al estado global. Esto permite que aparezca en la lista sin necesidad de recargar de la BD.  */
  const agregarPlantaLocal = useCallback((nuevaPlanta) => {
    dispatch({
      type: "[Plantas] - Agregar Nueva",
      payload: nuevaPlanta,
    });
  }, []);


  /* Actualiza las ubicaciones de una planta específica en el estado global. Ideal para cuando el usuario agrega una ubicación desde el detalle. */
  const agregarUbicacionAlEstado = useCallback((plantaId, nuevaUbi) => {
    dispatch({
      type: "[Plantas] - Actualizar Ubicaciones",
      payload: { plantaId, nuevaUbi },
    });
  }, []);

const actualizarPlantasTrasRegistro = useCallback((plantaProcesada) => {
    // Filtramos para evitar duplicados en la lista actual
    const listaActualizada = [
      plantaProcesada,
      ...state.plantas.filter((p) => p.id !== plantaProcesada.id),
    ];

    // Usamos el dispatch para actualizar el estado global y el mismo type de "Cargar Basico" porque sobreescribe el array de plantas
    dispatch({
      type: "[Plantas] - Cargar Basico",
      payload: listaActualizada,
    });
  }, [state.plantas]); // Dependencia del estado actual de plantas

console.log(state.plantas)

  return (
    <PlantasContext.Provider
      value={{
        ...state,
        // Métodos y Funciones
        cargarPlantasHome,
        agregarPlantaLocal,
        agregarUbicacionAlEstado,
        actualizarPlantasTrasRegistro,
      }}
    >
      {children}
    </PlantasContext.Provider>
  );
};
