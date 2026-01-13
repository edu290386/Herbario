import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Leaf, Search, PlusCircle } from 'lucide-react';

const colores = {
  bosque: "#2F4538",
  hoja: "#ADBC9F",
  retama: "#F4E285",
  fondo: "#F8F9F5"
};

function App() {
  const [plantasTotales, setPlantasTotales] = useState([]); // Toda la data de la nube
  const [busqueda, setBusqueda] = useState("");

  // 1. CARGA ÚNICA: Solo llamamos a Supabase al abrir la App
  useEffect(() => {
    // Definimos la función dentro para que React sepa que es de uso único aquí
    async function obtenerDatos() {
      try {
        const { data, error } = await supabase.from('plantas').select('*');
        if (error) throw error;
        
        // El setState se llama solo cuando la promesa de Supabase termina
        setPlantasTotales(data || []);
      } catch (err) {
        console.error("Error inicial:", err.message);
      } 
    }

    obtenerDatos();
  }, []);

  // 2. FORMATEO: Forzar Primera Letra Mayúscula
  const manejarEscritura = (e) => {
    let valor = e.target.value;
    if (valor.length > 0) {
      valor = valor.charAt(0).toUpperCase() + valor.slice(1);
    }
    setBusqueda(valor);
  };

  // 3. FILTRADO LOCAL: No consume nube, es instantáneo
  const plantasFiltradas = plantasTotales.filter(p => {
    const termino = busqueda.toLowerCase();
    return p.nombre_comun.toLowerCase().includes(termino) || 
           (p.nombres_secundarios || "").toLowerCase().includes(termino);
  });

  // 4. FUNCIÓN PARA CREAR CON CONFIRMACIÓN
  const crearNuevaPlanta = async () => {
  const confirmar = window.confirm(`¿Estás seguro de que deseas registrar "${busqueda}" como una nueva especie?`);
  
  if (confirmar) {
    // Lógica para guardar en Supabase (si acepta)
    const { data, error } = await supabase
      .from('plantas')
      .insert([{ nombre_comun: busqueda }])
      .select();

    if (!error) {
      alert("Planta registrada con éxito.");
      setPlantasTotales([...plantasTotales, data[0]]);
      setBusqueda(""); // Limpia el input y muestra todo
    }
  } else {
    // --- AQUÍ LA MEJORA: Si el usuario cancela ---
    setBusqueda(""); // Al poner el buscador en blanco, el filtro muestra automáticamente TODAS las plantas
  }
};

// función GPS
const registrarAvistamiento = (planta) => {
  // 1. Verificar si el navegador tiene GPS
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización.");
    return;
  }

  // 2. Solicitar la ubicación actual
  navigator.geolocation.getCurrentPosition(async (posicion) => {
    const { latitude, longitude } = posicion.coords;

    // 3. Confirmación visual para la demo
    const confirmar = window.confirm(
      `¿Registrar ubicación para "${planta.nombre_comun}"?\n\nLatitud: ${latitude}\nLongitud: ${longitude}`
    );

    if (confirmar) {
      // 4. Guardar en la tabla 'ubicaciones' de Supabase
      const { error } = await supabase.from('ubicaciones').insert([
        {
          planta_id: planta.id,
          latitud: latitude,
          longitud: longitude,
          // Dejamos la foto como texto por ahora para no complicar la demo
          foto_contexto: "Imagen capturada en campo" 
        }
      ]);

      if (error) {
        console.error("Error al guardar:", error.message);
        alert("Hubo un error al guardar la ubicación.");
      } else {
        alert(`✅ ¡Éxito! Ubicación registrada para ${planta.nombre_comun}.`);
      }
    }
  }, (error) => {
    // Manejo de errores (ej: si el usuario niega el permiso)
    alert("Error al obtener ubicación: " + error.message);
  });
};

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: colores.fondo, minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
      <h1 style={{ color: colores.bosque, fontSize: '2.5rem', marginBottom: '20px' }}>🌿 Herbario de Ozain</h1>
        
        {/* BUSCADOR INTELIGENTE */}
         <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <Search 
          style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: colores.hoja }} 
          size={20} 
        />
          <input 
            type="text"
            placeholder="      Buscar o escribir nueva planta..."
            value={busqueda}
            onChange={manejarEscritura}
            style={{ 
            width: '100%', 
            padding: '15px 20px', 
            borderRadius: '30px', 
            border: `2px solid ${colores.hoja}`, 
            fontSize: '1.1rem',
            outline: 'none',
            backgroundColor: '#fff'
          }}
          />
        </div>
      </header>

      

      {/* BOTÓN DINÁMICO: Solo aparece si no hay coincidencias y el usuario escribió algo */}
      {busqueda.length > 2 && plantasFiltradas.length === 0 && (
        <div style={{ textAlign: 'center', marginBottom: '30px', animation: 'fadeIn 0.5s' }}>
          <p>No encontramos "{busqueda}" en el catálogo.</p>
          <button 
            onClick={crearNuevaPlanta}
            style={{ background: '#2d5a27', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusCircle size={20} /> Registrar "{busqueda}" como nueva especie
          </button>
        </div>
      )}

      {/* GRILLA DE RESULTADOS */}
      <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '25px' 
    }}>
  {plantasFiltradas.map(planta => (
    <div key={planta.id} style={{ 
          border: `1px solid ${colores.hoja}`, 
          borderRadius: '16px', 
          padding: '20px', 
          backgroundColor: '#fff',
          display: 'flex', 
          flexDirection: 'column', // Organiza contenido en vertical
          minHeight: '400px',      // Altura fija para que no se deformen
          boxShadow: '0 24px 12px rgba(0,0,0,0.05)'
        }}>
      
      {/* Espacio para la foto o icono */}
      <div style={{ height: '300px', background: colores.fondo, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <Leaf color={colores.bosque} size={40} />
          </div>

      {/* Nombre Principal */}
      <div style={{ flexGrow: 1 }}>
            <h3 style={{ margin: '0 0 5px 0', color: colores.bosque, fontSize: '1.3rem' }}>
              {planta.nombre_comun}
            </h3>
            
            <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', marginBottom: '5px' }}>
              {planta.nombre_cientifico || "Especie no identificada"}
            </p>

            {/* Sección de Nombres Secundarios (Espacio para ~5 nombres) */}
            <div style={{ borderTop: `1px solid ${colores.fondo}`, paddingTop: '5px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: colores.hoja }}>OTROS NOMBRES:</span>
              <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '5px', lineHeight: '1.4' }}>
                {planta.nombres_secundarios || "Sin alias registrados"}
              </p>
            </div>
          </div>

      {/* Botón de ubicación que pondremos pronto */}
      <button 
            onClick={() => registrarAvistamiento(planta)}
            style={{ 
              marginTop: '15px', 
              width: '100%', 
              padding: '12px', 
              background: colores.retama, 
              color: colores.bosque, 
              border: `2px solid ${colores.bosque}`, 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Ver / Registrar Ubicación
          </button>
    </div>
  ))}
</div>
    </div>
  );
}

export default App;