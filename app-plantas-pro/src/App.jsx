import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DetallePage } from './pages/DetallePage';
import { Registro } from './pages/Registro'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal donde está el buscador */}
        <Route path="/" element={<HomePage />} />

        {/* Ruta para ver el detalle de una planta (carrusel, info, etc.) */}
        <Route path="/planta/:nombre" element={<DetallePage />} />

        {/* NUEVA RUTA: El formulario inteligente que acabamos de crear */}
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;