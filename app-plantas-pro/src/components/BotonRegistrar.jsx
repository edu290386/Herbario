import React from 'react';
import { MapPin } from 'lucide-react';
import { colores } from '../constants/tema';


export const BotonRegistrar = ({ onClick, texto = "Registrar Ubicación", estiloAdicional = {} }) => {
  return (
    <button 
      onClick={onClick} 
      style={estilos.btn}
    >
      <MapPin size={18} />
      {texto}
    </button>
  );
};

const estilos = {
  btn: {
    backgroundColor: colores.retama,
    color: colores.bosque,
    border: `1px solid ${colores.bosque}`,
    padding: '12px 20px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    width: '100%', // Por defecto ocupa el ancho de su contenedor (el card)
    transition: 'opacity 0.2s',
  }
};