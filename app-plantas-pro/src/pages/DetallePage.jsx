import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { colores } from "../constants/tema";
import { Leaf, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { BotonRegistrar } from "../components/BotonRegistrar";


export const DetallePage = () => {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const [planta, setPlanta] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDetalle = async () => {
      try {

        const nombreBusqueda = nombre.replace(/-/g, " ");

        const { data, error } = await supabase
          .from("plantas")
          .select(
            `
            *,
            ubicaciones (*)
          `
          )
          .ilike("nombre_comun", nombreBusqueda)
          .single();

        if (error) throw error;
        setPlanta(data);
      } catch (error) {
        console.error("Error cargando detalle:", error.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerDetalle();
  }, [nombre]);

  if (cargando) return <div style={estilos.loading}>Cargando Información de planta...</div>;
  if (!planta) return <div style={estilos.loading}>Planta no encontrada.</div>;

  return (
    <div style={estilos.pagina}>
      {/* Botón Volver */}
      <button onClick={() => navigate(-1)} style={estilos.btnVolver}>
        <ArrowLeft size={20} /> Volver
      </button>

      {/* Cabecera con Imagen */}
      <div style={estilos.header}>
        {planta.foto_perfil ? (
          <img
            src={planta.foto_perfil}
            alt={planta.nombre_comun}
            style={estilos.fotoPrincipal}
          />
        ) : (
          <div style={estilos.fallback}>
            <Leaf size={80} color={colores.retama} strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Información Principal */}
      <div style={estilos.contenido}>
        <h1 style={estilos.nombre}>{planta.nombre_comun?.toUpperCase()}</h1>
        <p style={estilos.cientifico}>
          <i>
            {!planta.nombre_cientifico ||
            planta.nombre_cientifico === null
              ? "Nombre científico pendiente"
              : planta.nombre_cientifico}
          </i>
        </p>

        <div style={estilos.divisor} />

        {/* Sección de Ubicaciones */}
        <h3 style={estilos.subtitulo}>AVISTAMIENTOS REGISTRADOS</h3>
        <div style={estilos.listaUbicaciones}>
          {planta.ubicaciones?.length > 0 ? (
            planta.ubicaciones.map((loc) => (
              <div key={loc.id} style={estilos.itemUbicacion}>
                <MapPin size={18} color={colores.bosque} />
                <div style={estilos.locInfo}>
                  <p style={estilos.fecha}>
                    <Calendar size={14} />{" "}
                    {new Date(loc.created_at).toLocaleDateString()}
                  </p>
                  <p style={estilos.coords}>
                    {loc.latitud.toFixed(4)}, {loc.longitud.toFixed(4)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={estilos.vacio}>No hay ubicaciones registradas aún.</p>
          )}
        </div>

        <BotonRegistrar
          texto="AÑADIR NUEVA UBICACIÓN"
          onClick={() =>
            navigate("/registro", {
              state: { plantaId: planta.id, nombreComun: planta.nombre_comun },
            })
          }
        />
      </div>
    </div>
  );
};

const estilos = {
  pagina: { minHeight: "100vh", backgroundColor: "#f9fbf9" },
  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#1A3C34",
    fontWeight: "bold",
  },
  btnVolver: {
    position: "absolute",
    top: "20px",
    left: "20px",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "8px 15px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#1A3C34",
  },
  header: {
    width: "100%",
    height: "40vh",
    position: "relative",
    overflow: "hidden",
  },
  fotoPrincipal: { width: "100%", height: "100%", objectFit: "cover" },
  fallback: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(180deg, #1A3C34 0%, #0d1e1a 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  contenido: {
    padding: "30px",
    backgroundColor: "white",
    marginTop: "-30px",
    borderTopLeftRadius: "30px",
    borderTopRightRadius: "30px",
    position: "relative",
    minHeight: "60vh",
  },
  nombre: {
    margin: "0",
    fontSize: "1.8rem",
    color: "#1A3C34",
    fontWeight: "800",
  },
  cientifico: { color: "#666", marginBottom: "20px" },
  divisor: { height: "1px", backgroundColor: "#eee", margin: "20px 0" },
  subtitulo: {
    fontSize: "0.9rem",
    letterSpacing: "1px",
    color: "#1A3C34",
    opacity: 0.7,
    marginBottom: "15px",
  },
  listaUbicaciones: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "30px",
  },
  itemUbicacion: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    borderRadius: "15px",
    backgroundColor: "#f0f4f1",
  },
  fecha: {
    margin: 0,
    fontSize: "0.8rem",
    color: "#555",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  coords: { margin: 0, fontWeight: "bold", color: "#1A3C34" },
  vacio: { fontStyle: "italic", color: "#999" },
};
