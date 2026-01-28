export const types = {
  login: "[Auth] Login",
  logout: "[Auth] Logout",
};

export const authReducer = (state = {}, action) => {
  switch (action.type) {
    case types.login:
      return {
        ...state,
        logged: true,
        user: action.payload, // Aquí guardamos toda la info de Supabase
      };

    case types.logout:
      return {
        logged: false,
      };

    default:
      return state;
  }
};
