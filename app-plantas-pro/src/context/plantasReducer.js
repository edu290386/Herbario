export const plantasReducer = (state, action) => {
  switch (action.type) {
    case "[Plantas] - Set Cargando":
      return { ...state, cargando: true };

    case "[Plantas] - Cargar Basico":
      return {
        ...state,
        plantas: action.payload,
        cargando: false,
      };

    case "[Plantas] - Agregar Nueva":
      return {
        ...state,
        plantas: [action.payload, ...state.plantas],
      };

    case "[Plantas] - Actualizar o Insertar": {
      // 🚩 Asegúrate que el nombre sea IDÉNTICO
      console.log("3. LOG LOGRADO: Procesando planta...", action.payload);

      const existe = state.plantas.some((p) => p.id === action.payload.id);

      return {
        ...state,
        plantas: existe
          ? state.plantas.map((p) =>
              p.id === action.payload.id ? { ...p, ...action.payload } : p,
            )
          : [action.payload, ...state.plantas],
      };
    }

    default:
      return state;
  }
};
