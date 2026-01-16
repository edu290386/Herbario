import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OtrosNombres } from './OtrosNombres'; // El que creamos antes
import { colores } from '../constants/tema';
import { transformarImagen } from '../helpers/cloudinaryHelper';
import { BotonRegistrar } from './BotonRegistrar';
import { Leaf } from "lucide-react";

export const CardPlanta = ({ planta }) => {
  const navigate = useNavigate();

  const manejarRegistro = (e) => {
    e.stopPropagation(); // ¡Importante! Evita que el clic "atraviese" el botón
    navigate("/registro", {
      state: {
        plantaId: planta.id,
        nombreComun: planta.nombre_comun,
      },
    });
  };

  return (
    <div style={estilos.card}>
      {/* 1. Contenedor de Imagen con tamaño fijo */}
      <div
        style={estilos.contenedorImagen}
        onClick={() => navigate(`/planta/${planta.nombre_comun}`,{state:{planta}})}
      >
        {planta.foto_perfil ? (
          <img
            src={transformarImagen(planta.foto_perfil)}
            alt={planta.nombre_comun}
            style={estilos.img}
          />
        ) : (
          <div style={estilos.fallbackBosque}>
            <Leaf
              size={60}
              color={colores.frondoso}
              strokeWidth={1}
              style={estilos.hojaIcono}
            />
          </div>
        )}
      </div>

      {/* 2. Área de Información con Flexbox */}
      <div style={estilos.infoCard}>
        <div style={estilos.contenidoTexto}>
          <h2 style={estilos.nombreComun}>{planta.nombre_comun}</h2>

          <p style={estilos.nombreCientifico}>
            <i>{planta.nombre_cientifico || "Nombre científico pendiente"}</i>
          </p>

          {/* Reutilizamos el componente de nombres secundarios */}
          <OtrosNombres lista={planta.nombres_secundarios} />
        </div>

        {/* 3. Botón siempre al fondo */}
        <BotonRegistrar
          texto="Agregar Ubicación"
          // Pasamos el ID y el nombre (el nombre solo para mostrarlo en el formulario)
          onClick={manejarRegistro}
        />
      </div>
    </div>
  );
};

const estilos = {
  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "340px", // El ancho grande que pediste
    height: "620px", // El alto grande que pediste
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease",
    isolation: "isolate", // Mejora nitidez de bordes
  },
  contenedorImagen: {
    height: "350px",
    width: "100%",
    flexShrink: 0,
    backgroundColor: "#f9f9f9",
    cursor: 'pointer',
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  infoCard: {
    padding: "25px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  contenidoTexto: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  nombreComun: {
    margin: 0,
    fontSize: "1.4rem",
    color: colores.bosque,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  nombreCientifico: {
    margin: "0 0 10px 0",
    fontSize: "1rem",
    color: "#888",
  },
  boton: {
    backgroundColor: colores.retama,
    color: colores.bosque,
    border: `2px solid ${colores.bosque}`,
    padding: "15px",
    borderRadius: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "15px",
    fontSize: "0.9rem",
    letterSpacing: "1px",
  },
  fallbackBosque: {
    width: "100%",
    height: "100%",
    background: colores.retama,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: '0.7',
  },
};