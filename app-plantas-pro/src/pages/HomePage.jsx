import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Leaf, Search, PlusCircle, MapPin } from 'lucide-react';
import { transformarImagen } from '../helpers/cloudinaryHelper';
import { BotonRegistrar } from '../components/BotonRegistrar';
import { colores } from '../constants/tema'
import { OtrosNombres } from '../components/OtrosNombres';


export const HomePage = () => {
  const [plantas, setPlantas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    obtenerPlantas();
  }, []);

  const obtenerPlantas = async () => {
    const { data } = await supabase.from('plantas').select('*');
    setPlantas(data || []);
    console.log(data)
  };

  const plantasFiltradas = plantas.filter(p => 
    p.nombre_comun.toLowerCase().includes(busqueda.toLowerCase())
  );

  const crearPlanta = async () => {
    const nombre = prompt("Nombre de la nueva planta:");
    if (nombre) {
      const { data, error } = await supabase.from('plantas').insert([{ nombre_comun: nombre }]).select();
      if (!error) obtenerPlantas(); // Recarga rápida
    }
  };

 return (
    <div style={estilos.pagina}>
      <header style={estilos.header}>
        <div style={estilos.logoSeccion}>
          <Leaf color={colores.retama} size={32} fill={colores.retama} />
          <h1 style={estilos.titulo}>Herbario de Ozain</h1>
        </div>
        
        <div style={estilos.buscadorWrapper}>
          <Search style={estilos.iconoBusqueda} color={colores.hoja} size={20} />
          <input 
            style={estilos.input}
            placeholder="Busca tu planta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      <main style={estilos.grilla}>
        {plantasFiltradas.map((planta) => (
          <div 
            key={planta.id} 
            onClick={() => navigate(`/planta/${planta.id}`)}
            style={estilos.card}
          >
            <div style={estilos.contenedorImagen}>
              {planta.foto_perfil ? (
                <img 
                  src={transformarImagen(planta.foto_perfil)} 
                  style={estilos.img} 
                  alt={planta.nombre_comun}
                />
              ) : (
                <div style={estilos.placeholder}>
                  <Leaf color={colores.hoja} size={48} opacity={0.3} />
                </div>
              )}
            </div>
            
            <div style={estilos.infoCard}>
              <div style={estilos.contenidoTexto}>
                <h2 style={estilos.nombreComun}>{planta.nombre_comun}</h2>
                <p style={estilos.nombreCientifico}><i>{planta.nombre_cientifico || "Sin nombre científico"}</i></p>
                <OtrosNombres lista={planta.nombres_secundarios} />
              </div>
            
              <BotonRegistrar 
                 onClick={(e) => {
                 e.stopPropagation(); // Evita que al hacer clic se active el navigate del card
                 navigate(`/planta/${planta.id}?abrirForm=true`);
                }} 
              />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

const estilos = {
  pagina: { backgroundColor: colores.fondo, minHeight: '100vh', padding: '20px', fontFamily: '"Segoe UI", sans-serif' },
  header: { maxWidth: '800px', margin: '0 auto 40px', textAlign: 'center' },
  logoSeccion: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
  titulo: { color: colores.bosque, fontSize: '2.2rem', fontWeight: '800', margin: 0 },
  buscadorWrapper: { position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '600px', margin: '0 auto' },
  iconoBusqueda: { position: 'absolute', left: '15px' },
  input: { 
    width: '100%', padding: '15px 15px 15px 50px', borderRadius: '25px', 
    border: `2px solid ${colores.hoja}`, outline: 'none', fontSize: '1rem'
  },
  
  // GRILLA CORREGIDA: Multi-columna en escritorio, 1 columna en móvil
  grilla: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
    gap: '25px', 
    maxWidth: '1550px', 
    margin: '0 auto',
    justifyItems: 'center' // Centra los cards cuando hay solo uno
  },
  
  card: { 
    backgroundColor: 'white', borderRadius: '25px', overflow: 'hidden', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)', cursor: 'pointer',
    width: '100%', maxWidth: '400px', height: '620px', display: 'flex',
    flexDirection: 'column' 
  },
  
  contenedorImagen: { 
    height: '400px', // Altura fija que tú elijas
    width: '100%',
    flexShrink: 0,   // <--- ESTA ES LA CLAVE
    backgroundColor: '#f0f0f0',
    overflow: 'hidden'
  },
  
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  
  placeholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  infoCard: { 
    padding: '20px', 
    textAlign: 'left',
    flex: 1, 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white'
  },

  
  nombreComun: { color: colores.bosque, margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: 'bold' },
  
  nombreCientifico: { color: '#555', margin: '0 0 15px 0', fontSize: '0.95rem' },
  
  seccionOtros: { marginBottom: '20px' },
  
  labelOtros: { fontWeight: '800', fontSize: '0.7rem', color: colores.bosque },
  
  textoOtros: { fontSize: '0.8rem', color: '#666' },
  
  contenidoTexto: { flex: 1  }// Este div "crece" y empuja al botón hacia abajo
  
};