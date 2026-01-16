import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DetallePage } from './pages/DetallePage';
import { FormularioRegistro } from "./components/FormularioRegistro";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal donde está el buscador */}
        <Route path="/" element={<HomePage />} />

        {/* Ruta para ver el detalle de una planta (carrusel, info, etc.) */}
        <Route path="/planta/:id" element={<DetallePage />} />

        {/* NUEVA RUTA: El formulario inteligente que acabamos de crear */}
        <Route path="/nuevo-registro" element={<FormularioRegistro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;