import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Camera } from 'lucide-react';
import { FormularioRegistro } from '../components/FormularioRegistro';
import { transformarImagen } from '../helpers/cloudinaryHelper';
import { BotonRegistrar } from '../components/BotonRegistrar';
import { colores } from '../constants/tema';


export const DetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planta, setPlanta] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrandoForm, setMostrandoForm] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    const [resPlanta, resUbis] = await Promise.all([
      supabase.from('plantas').select('*').eq('id', id).single(),
      supabase.from('ubicaciones').select('*').eq('planta_id', id).order('created_at', { ascending: false })
    ]);
    setPlanta(resPlanta.data);
    setUbicaciones(resUbis.data || []);
    setCargando(false);
  };

  if (cargando) return <div style={estilos.sinDatos}>Cargando herbario...</div>;

  const fotosBotanicas = [
    { label: 'General', url: planta.foto_perfil },
    { label: 'Tallo', url: planta.foto_tallo },
    { label: 'Hoja', url: planta.foto_hoja },
    { label: 'Fruto', url: planta.foto_fruto },
    { label: 'Raíz', url: planta.foto_raiz }
  ].filter(f => f.url);

  return (
    <div style={estilos.pagina}>
      <header style={estilos.header}>
        <button onClick={() => navigate('/')} style={estilos.btnVolver}>
          <ArrowLeft color={colores.bosque} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={estilos.titulo}>{planta.nombre_comun}</h1>
          <p style={estilos.cientifico}>{planta.nombre_cientifico || "Especie no identificada"}</p>
        </div>
      </header>

      <section style={estilos.seccion}>
        <h3 style={estilos.h3}>Detalle Botánico</h3>
        <div style={estilos.carrusel}>
          {fotosBotanicas.map((foto, i) => (
            <div key={i} style={estilos.cardBotanica}>
              <img src={foto.url} style={estilos.img} alt={foto.label} />
              <div style={estilos.badge}>{foto.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={estilos.seccion}>
        <div style={estilos.headerRutas}>
          <h3 style={estilos.h3}>Guía de Ubicación ({ubicaciones.length})</h3>
          <BotonRegistrar 
            texto="Agregar Punto"
            estiloAdicional={{ width: 'auto', padding: '10px 25px' }} 
            onClick={() => setMostrandoForm(true)} 
          />
        </div>

        {ubicaciones.map((punto) => (
          <div key={punto.id} style={estilos.tarjetaRuta}>
            <div style={estilos.gridFotos}>
              <div style={estilos.marco}><img src={transformarImagen(punto.foto_contexto)} style={estilos.img} /></div>
              <div style={estilos.marco}>
                <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${punto.latitud},${punto.longitud}&zoom=17&size=300x300&markers=${punto.latitud},${punto.longitud}&key=TU_API_KEY`} style={estilos.img} />
              </div>
            </div>
            <p style={estilos.descripcionPunto}>{punto.descripcion}</p>
          </div>
        ))}
      </section>

      {mostrandoForm && (
        <FormularioUbicacion 
          plantaId={id} 
          onExito={() => { setMostrandoForm(false); cargarDatos(); }}
          onCancelar={() => setMostrandoForm(false)}
        />
      )}
    </div>
  );
};

// --- EL OBJETO QUE TE FALTABA ---
const estilos = {
  pagina: { padding: '15px', maxWidth: '800px', margin: '0 auto', backgroundColor: colores.fondo, minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' },
  btnVolver: { background: 'white', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  titulo: { margin: 0, color: colores.bosque, fontSize: '1.6rem' },
  cientifico: { margin: 0, color: '#666', fontStyle: 'italic' },
  seccion: { marginBottom: '30px' },
  h3: { color: colores.bosque, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '15px' },
  carrusel: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  cardBotanica: { minWidth: '200px', height: '250px', position: 'relative', borderRadius: '15px', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { position: 'absolute', bottom: '10px', left: '10px', background: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' },
  headerRutas: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  btnAgregar: { backgroundColor: colores.bosque, color: 'white', border: 'none', padding: '10px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' },
  tarjetaRuta: { backgroundColor: 'white', borderRadius: '15px', padding: '12px', marginBottom: '15px', border: `1px solid ${colores.hoja}` },
  gridFotos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  marco: { height: '150px', borderRadius: '10px', overflow: 'hidden' },
  descripcionPunto: { marginTop: '10px', fontSize: '0.9rem', color: '#444' },
  sinDatos: { textAlign: 'center', padding: '50px', color: colores.hoja }
};

