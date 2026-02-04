import { colores } from '../../constants/tema';

export const OtrosNombres = ({ lista }) => {
 
  // 2. Si es nulo o vacío, no mostramos nada
  if (!lista || lista.length <= 1) return null;

  // 3. Convertir a Array si viene como String de Postgres "{a,b}" o string simple "a,b"
  const nombresSecundarios = lista.slice(1);
  
  return (
    <div style={estilos.contenedor}>
      <span style={estilos.label}>Otros Nombres: </span>
      <span style={estilos.texto}>
        {nombresSecundarios.map((nombre, i) => (
          <span key={i}>
            {nombre.trim()} {/* trim() quita espacios extra */}
            {i < nombresSecundarios.length - 1 ? ', ' : ''}
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