import React from 'react';
import { colores } from '../constants/tema';

export const OtrosNombres = ({ lista }) => {
  // 1. Log para depurar: Mira tu consola del navegador (F12) para ver qué llega
  //console.log("Dato en OtrosNombres:", lista);

  // 2. Si es nulo o vacío, no mostramos nada
  if (!lista) return null;

  // 3. Convertir a Array si viene como String de Postgres "{a,b}" o string simple "a,b"
  let nombresFinales = [];
  
  if (Array.isArray(lista)) {
    nombresFinales = lista;
  } else if (typeof lista === 'string') {
    // Limpiamos llaves de Postgres y separamos por comas
    nombresFinales = lista.replace(/{|}/g, '').split(',');
  }

  if (nombresFinales.length === 0) return null;

  return (
    <div style={estilos.contenedor}>
      <span style={estilos.label}>Otros Nombres: </span>
      <span style={estilos.texto}>
        {nombresFinales.map((nombre, i) => (
          <span key={i}>
            {nombre.trim()} {/* trim() quita espacios extra */}
            {i < nombresFinales.length - 1 ? ', ' : ''}
          </span>
        ))}
      </span>
    </div>
  );
};

const estilos = {
  contenedor: { margin: '8px 0', lineHeight: '1.4' },
  label: { fontWeight: '700', fontSize: '1rem', color: colores.bosque, letterSpacing: '0.4px' },
  texto: { fontSize: '0.95rem', color: '#666' }
};