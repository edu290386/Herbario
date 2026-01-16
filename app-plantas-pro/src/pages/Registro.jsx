import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Leaf, Camera, MapPin, CheckCircle } from "lucide-react"; // Iconos consistentes
import { supabase } from "../supabaseClient";
import { uploadImage } from "../helpers/cloudinaryHelper";
import { BotonRegistrar } from "../components/BotonRegistrar"; // Tu componente reutilizable
import { colores } from "../constants/tema";

export const Registro = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const plantaId = state?.plantaId;
  const nombreRecibido = state?.nombreComun || "Nueva Planta";

  const [cargando, setCargando] = useState(false);
  const [foto, setFoto] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lng: null });


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Activa el GPS para registrar la ubicación")
    );
  }, []);

  const manejarEnvio = async () => {
    if (!foto || !coords.lat) return alert("Captura la foto y la ubicación");
    setCargando(true);
    try {
      const urlFoto = await uploadImage(foto);
      let idFinal = plantaId;

      if (!idFinal) {
        const { data: nuevaP, error: errP } = await supabase
          .from("plantas")
          .insert([{ nombre_comun: nombreRecibido }])
          .select()
          .single();
        if (errP) throw errP;
        idFinal = nuevaP.id;
      }

      const { error: errU } = await supabase.from("ubicaciones").insert([
        {
          planta_id: idFinal,
          foto_contexto: urlFoto,
          latitud: coords.lat,
          longitud: coords.lng,
        },
      ]);

      if (errU) throw errU;
      navigate("/");
    } catch (e) {
      alert(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.pagina}>
      <header style={estilos.header}>
        {/* Usamos el color desde temas.js */}
        <Leaf size={40} color={colores.frondoso} />
        <h1 style={{...estilos.titulo, color: colores.bosque}}>REGISTRO DE CAMPO</h1>
      </header>

      <main style={estilos.cardForm}>
        <div style={estilos.infoSeccion}>
          <span style={estilos.label}>Planta seleccionada:</span>
          <h2 style={{...estilos.nombrePlanta, color: colores.frondoso}}>
            {(state?.nombreComun || "Nueva Planta").toUpperCase()}
          </h2>
        </div>

        {/* Zona de Cámara con borde del color del bosque */}
        <label style={{...estilos.zonaCamara, borderColor: colores.bosque}}>
          {foto ? (
            <div style={{color: colores.bosque}}>
              <CheckCircle size={50} color={colores.frondoso} />
              <p>FOTO CAPTURADA</p>
            </div>
          ) : (
            <div style={{color: colores.bosque}}>
              <Camera size={50} color={colores.bosque} />
              <p>TOCAR PARA TOMAR FOTO</p>
            </div>
          )}
          <input 
            type="file" accept="image/*" capture="environment" 
            onChange={(e) => setFoto(e.target.files[0])} 
            style={{ display: 'none' }} 
          />
        </label>

        {/* Indicador GPS */}
        <div style={estilos.statusGps}>
          <MapPin size={20} color={coords.lat ? "#4CAF50" : "#F44336"} />
          <span style={{color: '#555'}}>
            {coords.lat ? "Ubicación de GPS capturada" : "Buscando satélites..."}
          </span>
        </div>

        <BotonRegistrar 
          texto={cargando ? "GUARDANDO..." : "FINALIZAR REGISTRO"} 
          onClick={manejarEnvio}
          disabled={cargando || !coords.lat || !foto}
        />
      </main>
    </div>
  );
};

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: "#f4f7f4",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    margin: "30px 0",
    color: "#1b3d18",
  },
  titulo: { fontSize: "1.5rem", fontWeight: "800", letterSpacing: "2px" },
  cardForm: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "25px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  infoSeccion: { marginBottom: "25px" },
  label: { fontSize: "0.8rem", color: "#888", fontWeight: "bold" },
  nombrePlanta: { color: "#1b3d18", margin: "5px 0 0 0", fontSize: "1.2rem" },
  zonaCamara: {
    width: "100%",
    height: "200px",
    border: "2px dashed #1b3d18",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: "#f9fbf9",
    marginBottom: "20px",
    color: "#1b3d18",
    fontWeight: "bold",
  },
  statusGps: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "30px",
    fontSize: "0.9rem",
    color: "#555",
  },
  previsualizacion: { color: "#1b3d18" },
};
