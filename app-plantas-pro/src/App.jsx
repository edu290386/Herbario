import { AuthProvider } from "./context/AuthProvider";
import { PlantasProvider } from "./context/PlantasProvider";
import { AppRouter } from "./router/AppRouter";
import { BrowserRouter,  } from "react-router-dom";


export const App = () => {
  return (
    <AuthProvider>
      <PlantasProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </PlantasProvider>
    </AuthProvider>
  );
};

