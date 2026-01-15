import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, MapPin, Loader2 } from 'lucide-react';

const colores = { bosque: "#2F4538", hoja: "#ADBC9F", fondo: "#F1F2ED" };

export const FormularioUbicacion = ({ plantaId, onExito, onCancelar }) => {
  const [cargando, setCargando] = useState(false);
  const [descripcion, setDescripcion] = useState("");

  const obtenerDireccion = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      // Extraemos distrito/barrio y ciudad
      const distrito = data.address.suburb || data.address.neighbourhood || data.address.village || "";
      const ciudad = data.address.city || data.address.town || "";
      return `${distrito}${distrito && ciudad ? ', ' : ''}${ciudad}`;
    } catch {
      return "Ubicación desconocida";
    }
  };

  const iniciarRegistro = () => {
    setCargando(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      // 1. Obtener dirección automática
      const infoLugar = await obtenerDireccion(latitude, longitude);

      // 2. Abrir Cloudinary
      const widget = window.cloudinary.createUploadWidget({
        cloudName: 'dk9faaztd',
        uploadPreset: 'plantas_preset',
        sources: ['local', 'camera'],
        multiple: false, // <--- FUERZA SOLO UNA FOTO
        resourceType: 'image', // <--- PROHÍBE VIDEOS
        clientAllowedFormats: ['jpg', 'png', 'jpeg', 'heic'], // Acepta HEIC pero lo convertiremos
        language: "es",
        singleUploadAutoClose: true,
      }, async (error, result) => {
        if (result.event === "success") {
          // 3. Guardar en Supabase
          const { error: dbError } = await supabase.from('ubicaciones').insert([
            { 
              planta_id: plantaId, 
              latitud: latitude, 
              longitud: longitude, 
              foto_contexto: result.info.secure_url,
              descripcion: descripcion || `Cerca de ${infoLugar}` // Automático si no hay descripción
            }
          ]);

          if (!dbError) {
            onExito();
          }
        }
        if (result.event === "close") setCargando(false);
      });

      widget.open();
    }, () => {
      alert("Error al obtener GPS");
      setCargando(false);
    });
  };

  return (
    <div style={estilos.overlay}>
      <div style={estilos.modal}>
        <h3 style={{ color: colores.bosque, marginTop: 0 }}>Registrar Hallazgo</h3>
        
        <label style={estilos.label}>Descripción (Opcional):</label>
        <textarea 
          placeholder="Ej: Al lado de la piedra grande..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={estilos.textarea}
        />

        <div style={estilos.botones}>
          <button onClick={onCancelar} style={estilos.btnSecundario} disabled={cargando}>
            Cancelar
          </button>
          <button onClick={iniciarRegistro} style={estilos.btnPrincipal} disabled={cargando}>
            {cargando ? <Loader2 className="animate-spin" /> : <><Camera size={18} /> Tomar Foto y GPS</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const estilos = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' },
  modal: { backgroundColor: 'white', padding: '20px', borderRadius: '20px', width: '100%', maxWidth: '350px' },
  label: { fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '8px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${colores.hoja}`, minHeight: '80px', marginBottom: '20px', outline: 'none', fontFamily: 'inherit' },
  botones: { display: 'flex', gap: '10px' },
  btnPrincipal: { flex: 2, backgroundColor: colores.bosque, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  btnSecundario: { flex: 1, backgroundColor: '#eee', border: 'none', borderRadius: '12px', color: '#666' }
};