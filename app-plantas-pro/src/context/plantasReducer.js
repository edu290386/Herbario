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

    default:
      return state;
  }
};
