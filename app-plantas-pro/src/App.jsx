import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Leaf, Search, PlusCircle } from 'lucide-react';

const colores = {
  bosque: "#2F4538",
  hoja: "#ADBC9F",
  retama: "#F4E285",
  fondo: "#F1F2ED"
};

function App() {
  const [plantasTotales, setPlantasTotales] = useState([]); // Toda la data de la nube
  const [busqueda, setBusqueda] = useState("");
  const [mostrandoConfirmar, setMostrandoConfirmar] = useState(false);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState(null);
  const [mensajeEstado, setMensajeEstado] = useState(""); // Para carga y éxito

  // 1. CARGA ÚNICA: Solo llamamos a Supabase al abrir la App
  useEffect(() => {
    // Definimos la función dentro para que React sepa que es de uso único aquí
    async function obtenerDatos() {
      try {
        const { data, error } = await supabase.from('plantas').select('*');
        console.log(data)
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

const iniciarRegistro = (planta) => {
  // 1. Verificar soporte (sin alerts molestos)
  if (!navigator.geolocation) {
    setMensajeEstado("❌ Tu dispositivo no soporta GPS");
    setTimeout(() => setMensajeEstado(""), 3000);
    return;
  }
  // 2. Abrir nuestra propia ventana de confirmación
  setPlantaSeleccionada(planta);
  setMostrandoConfirmar(true);
};

const ejecutarRegistro = () => {
  setMostrandoConfirmar(false);
  
  // 2. Solicitar la ubicación actual
  navigator.geolocation.getCurrentPosition(async (posicion) => {
    const { latitude, longitude } = posicion.coords;

    const widget = window.cloudinary.createUploadWidget({
      cloudName: 'dk9faaztd',
        uploadPreset: 'plantas_preset',
        sources: ['camera', 'local'], 
        multiple: false,
        showAdvancedOptions: false,
        language: "es",
        singleUploadAutoClose: true,
    }, async (error, result) => {
      // Cuando la subida es exitosa
      if (!error && result && result.event === "success") {
      	const urlFoto = result.info.secure_url;
        // 3. Guardar en la tabla 'ubicaciones' de Supabase con la URL real    
        const { error: dbError } = await supabase.from('ubicaciones').insert([
          {
            planta_id: plantaSeleccionada.id,
            latitud: latitude,
            longitud: longitude,
            foto_contexto: urlFoto // Aquí guardamos la URL de Cloudinary
          }
        ]);

        if (!dbError) {
          // 4. Mensaje de éxito final
          setMensajeEstado("✅ ¡Ubicación y Foto guardadas!");
          setTimeout(() => {
            setMensajeEstado("");
            setPlantaSeleccionada(null); // Limpiamos la planta actual
          }, 5000);
        } else {
          setMensajeEstado("❌ Error al conectar con la base de datos");
        }
      }
    });

    widget.open(); // Abre la cámara/galería
  }, (err) => {
    setMensajeEstado("❌ Error de GPS");
    setTimeout(() => setMensajeEstado(""), 5000);
  });
};

  return (
    <div style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: colores.fondo, minHeight: '100vh' }}>

       <header style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          padding: '0 15px' // Espacio para que no toque los bordes del celular
        }}>
      
       <h1 style={{ 
            color: colores.bosque, 
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', // Tamaño de fuente flexible
            margin: '0 0 15px 0'
          }}>
            🌿 Herbario de Ozain
      </h1>
        
        {/* BUSCADOR INTELIGENTE */}
         <div style={{ 
    position: 'relative', 
    width: '100%', 
    maxWidth: '600px', // Un poco más pequeño para que se vea mejor
    margin: '0 auto'   // Esto lo centra perfectamente
  }}>
          <input 
            type="text"
            placeholder="      Buscar o escribir nueva planta..."
            value={busqueda}
            onChange={manejarEscritura}
            style={{ 
            width: '95%', 
            padding: '12px 0px', 
            borderRadius: '16px', 
            border: `1px solid ${colores.hoja}`, 
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '18px' 
    }}>
  {plantasFiltradas.map(planta => (
    <div key={planta.id} style={{ 
          border: `1px solid ${colores.hoja}`, 
          borderRadius: '16px', 
          padding: '18px', 
          backgroundColor: '#fff',
          display: 'flex', 
          flexDirection: 'column', // Organiza contenido en vertical
          minHeight: '400px',      // Altura fija para que no se deformen
          boxShadow: '0 24px 12px rgba(0,0,0,0.05)'
        }}>
      
      {/* Espacio para la foto o icono */}
      <div style={{ height: '380px', width: '100%', background: colores.fondo, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden', position: 'relative', border: `1px solid rgba(0,0,0,0.05)` }}>
            {planta.foto_perfil ? (
    <img 
      src={planta.foto_perfil.replace('/upload/', '/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/')} 
      alt={planta.nombre_comun}
      loading='lazy'
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover', // Mantiene la proporción y rellena el espacio
        display: 'block'
      }}
    />
    ) : (
      <Leaf color={colores.bosque} size={40} opacity={0.5} />
    )}
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
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: colores.bosque }}>Otros nombres:</span>
              <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '5px', lineHeight: '1.4' }}>
                {planta.nombres_secundarios || "Sin alias registrados"}
              </p>
            </div>
          </div>

      {/* Botón de ubicación que pondremos pronto */}
      <button 
            onClick={() => iniciarRegistro(planta)}
            style={{ 
              marginTop: '15px', 
              width: '100%', 
              padding: '12px', 
              background: colores.retama, 
              color: colores.bosque, 
              border: `1px solid ${colores.hoja}`, 
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
  {mostrandoConfirmar && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
    <div style={{ backgroundColor: 'white', padding: '2px 15px 25px 15px', borderRadius: '15px', width: '85%', maxWidth: '300px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>¿Registrar ubicación para {plantaSeleccionada?.nombre_comun}?</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setMostrandoConfirmar(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#eee' }}>Cancelar</button>
        <button onClick={ejecutarRegistro} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: colores.bosque, color: 'white' }}>Confirmar</button>
      </div>
    </div>
  </div>
)}

{/* Mensaje Flotante de Estado (Cargando/Éxito) */}
{mensajeEstado && (
  <div style={{ 
    position: 'fixed', 
    bottom: '50px', // Un poco más arriba para que se vea bien sobre el pulgar
    left: '50%', 
    transform: 'translateX(-50%)', 
    backgroundColor: colores.bosque, // Un color oscuro sólido
    color: '#FFFFFF', 
    padding: '15px 30px', 
    borderRadius: '10px', 
    zIndex: 9999, // EL MÁS ALTO PARA QUE NADA LO TAPE
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    fontWeight: 'bold',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }}>
    {mensajeEstado}
  </div>
)}
</div>
    </div>
  );
}

export default App;