import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DetallePage } from './pages/DetallePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/planta/:id" element={<DetallePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;