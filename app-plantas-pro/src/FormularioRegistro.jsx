import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const FormularioRegistro = ({ alFinalizar }) => {
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const validarYCrear = async () => {
    const nombreLimpio = nombreNuevo.trim().toLowerCase();

    // 1. BUSCAR EN AMBOS CAMPOS ANTES DE CREAR
    const { data: plantasExistentes } = await supabase
      .from('plantas')
      .select('*')
      // Esta línea busca en nombre_comun O en nombres_secundarios
      .or(`nombre_comun.ilike.%${nombreLimpio}%,nombres_secundarios.ilike.%${nombreLimpio}%`);

    if (plantasExistentes && plantasExistentes.length > 0) {
      // 2. SI EXISTE, NO CREA NADA Y AVISA
      const coincidencia = plantasExistentes[0];
      setMensaje(`⚠️ Esta planta ya existe como: "${coincidencia.nombre_comun}". Agrégale la ubicación a esa ficha.`);
      return;
    }

    // 3. SI NO EXISTE, PROCEDE A CREAR LA FICHA MAESTRA (SIN FOTO DE PERFIL)
    const { error } = await supabase
      .from('plantas')
      .insert([{ nombre_comun: nombreNuevo.trim() }]);

    if (!error) {
      alert("Planta creada con éxito. Ahora añade la ubicación.");
      alFinalizar(); // Refresca la lista
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '10px', marginTop: '20px' }}>
      <h3>¿No encuentras la planta? Regístrala:</h3>
      <input 
        type="text" 
        placeholder="Nombre de la nueva especie..."
        value={nombreNuevo}
        onChange={(e) => setNombreNuevo(e.target.value)}
        style={{ padding: '8px', width: '70%', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      <button onClick={validarYCrear} style={{ padding: '8px 15px', marginLeft: '10px', background: '#2d5a27', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Verificar y Crear
      </button>
      {mensaje && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '10px' }}>{mensaje}</p>}
    </div>
  );
};

export default FormularioRegistro;