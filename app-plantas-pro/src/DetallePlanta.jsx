import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

  const DetallePlanta = ({ planta, alVolver }) => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(true);

  useEffect(() => {
    const obtenerUbicaciones = async () => {
      // Solo consultamos la subtabla de ubicaciones
      const { data, error } = await supabase
        .from('ubicaciones')
        .select('*')
        .eq('planta_id', planta.id);

      if (!error) setUbicaciones(data);
      setCargandoUbicaciones(false);
    };

    obtenerUbicaciones();
  }, [planta.id]);

  // Agrupamos las fotos botánicas que ya vienen en el prop 'planta'
  const fotosBotanicas = [
    { label: 'Perfil', url: planta.foto_perfil },
    { label: 'Tallo', url: planta.foto_tallo },
    { label: 'Hoja', url: planta.foto_hoja },
    { label: 'Fruto', url: planta.foto_fruto },
    { label: 'Raíz', url: planta.foto_raiz }
  ].filter(f => f.url);

  return (
    <div style={estilos.container}>
      {/* HEADER */}
      <div style={estilos.header}>
        <button onClick={alVolver} style={estilos.btnBack}>←</button>
        <div>
          <h1 style={estilos.titulo}>{planta.nombre_comun}</h1>
          <p style={estilos.cientifico}>{planta.nombre_cientifico}</p>
        </div>
      </div>

      {/* CARRUSEL BOTÁNICO (Datos inmediatos) */}
      <div style={estilos.carrusel}>
        {fotosBotanicas.map((foto, i) => (
          <div key={i} style={estilos.cardBotanica}>
            <img 
              src={foto.url.replace('/upload/', '/upload/w_1000,q_auto:best/')} 
              style={estilos.imgFill} 
              alt={foto.label}
            />
            <span style={estilos.etiqueta}>{foto.label}</span>
          </div>
        ))}
      </div>

      {/* SECCIÓN DE RUTAS (Datos del fetch) */}
      <section style={estilos.section}>
        <h2 style={estilos.h2}>Rutas de Acceso</h2>
        {cargandoUbicaciones ? (
          <p>Buscando rutas...</p>
        ) : ubicaciones.length > 0 ? (
          ubicaciones.map((punto, index) => (
            <div key={punto.id} style={estilos.itemRuta}>
              <div style={estilos.gridFotos}>
                <div style={estilos.marco}>
                  <img src={punto.foto_referencia} style={estilos.imgFill} />
                  <span style={estilos.tag}>Referencia Visual</span>
                </div>
                <div style={estilos.marco}>
                  <img 
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${punto.latitud},${punto.longitud}&zoom=18&size=400x400&markers=${punto.latitud},${punto.longitud}&key=TU_API_KEY`} 
                    style={estilos.imgFill} 
                  />
                  <span style={estilos.tag}>Mapa</span>
                </div>
              </div>
              <p style={estilos.descPunto}><b>Punto {index + 1}:</b> {punto.descripcion}</p>
              <p style={estilos.autor}>Autor: {punto.autor}</p>
            </div>
          ))
        ) : (
          <p>No hay rutas registradas para esta planta.</p>
        )}
      </section>
    </div>
  );
};

const estilos = {
  container: { padding: '15px', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  btnBack: { padding: '10px 15px', borderRadius: '50%', border: 'none', background: '#f0f0f0', fontSize: '1.2rem', cursor: 'pointer' },
  titulo: { margin: 0, fontSize: '1.6rem' },
  cientifico: { margin: 0, color: '#666', fontStyle: 'italic' },
  carrusel: { display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '10px' },
  cardBotanica: { minWidth: '280px', height: '350px', position: 'relative', borderRadius: '15px', overflow: 'hidden', flexShrink: 0 },
  imgFill: { width: '100%', height: '100%', objectFit: 'cover' },
  etiqueta: { position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' },
  itemRuta: { marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' },
  gridFotos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  marco: { height: '180px', borderRadius: '10px', overflow: 'hidden', position: 'relative' },
  tag: { position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '4px' },
  descPunto: { marginTop: '10px', fontSize: '0.9rem' },
  autor: { color: '#999', fontSize: '0.8rem' }
};

export default DetallePlanta;