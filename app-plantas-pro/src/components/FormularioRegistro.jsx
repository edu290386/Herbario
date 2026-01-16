import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { uploadImage } from "../helpers/cloudinaryHelper";

export const FormularioRegistro = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const plantaId = state?.plantaId;
  const nombreRecibido = state?.nombreComun || "";

  const [cargando, setCargando] = useState(false);
  const [foto, setFoto] = useState(null); // Para el archivo de imagen
  const [coords, setCoords] = useState({ lat: null, lng: null });

  // CAPTURA GPS AUTOMÁTICA AL ENTRAR
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (error) => alert("Por favor activa el GPS para registrar la ubicación")
    );
  }, []);

  const manejarEnvio = async () => {
    if (!foto || !coords.lat) {
      alert("Falta la foto o la ubicación GPS");
      return;
    }

    setCargando(true);
    try {
      // 1. SUBIR A CLOUDINARY (O TU HELPER)
      // Supongamos que tu función se llama subirImagen(foto)
      const urlFoto = await uploadImage(foto);

      let idFinal = plantaId;

      // 2. CREAR PLANTA SI ES NUEVA
      if (!idFinal) {
        const { data: nuevaP, error: errP } = await supabase
          .from("plantas")
          .insert([{ nombre_comun: nombreRecibido }])
          .select()
          .single();
        if (errP) throw errP;
        idFinal = nuevaP.id;
      }

      // 3. GUARDAR UBICACIÓN (Ya no será null)
      const { error: errU } = await supabase.from("ubicaciones").insert([
        {
          planta_id: idFinal,
          foto_contexto: urlFoto,
          latitud: coords.lat,
          longitud: coords.lng,
          created_at: new Date().toISOString(),
        },
      ]);

      if (errU) throw errU;
      alert("¡Guardado exitosamente!");
      navigate("/");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.container}>
      <h2>{plantaId ? "Nueva Ubicación" : "Registrar Planta"}</h2>
      <p>
        Planta: <strong>{nombreRecibido}</strong>
      </p>

      {/* INPUT PARA FOTO */}
      <input
        type="file"
        accept="image/*"
        capture="environment" // Abre la cámara directamente en móviles
        onChange={(e) => setFoto(e.target.files[0])}
      />

      {coords.lat ? (
        <p style={{ color: "green" }}>📍 Ubicación capturada</p>
      ) : (
        <p style={{ color: "red" }}>Buscando GPS...</p>
      )}

      <button onClick={manejarEnvio} disabled={cargando || !coords.lat}>
        {cargando ? "Guardando..." : "FINALIZAR REGISTRO"}
      </button>
    </div>
  );
};

const estilos = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center",
  },
};
