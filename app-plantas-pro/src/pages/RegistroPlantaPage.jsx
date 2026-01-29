import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Leaf, Camera, CheckCircle } from "lucide-react";
import { registrarUbicacionCompleta } from "../services/plantasServices";
import { uploadImage } from "../helpers/cloudinaryHelper";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { colores } from "../constants/tema";
import { BotonCancelar } from "../components/ui/BotonCancelar";
import { formatearParaDB } from "../helpers/textHelper";
import { OtrosNombres } from "../components/planta/OtrosNombres";
import {
  IoMdCheckmarkCircle,
  IoMdCloseCircle,
} from "react-icons/io";
import { obtenerDireccion } from "../helpers/geoHelper";
import { AuthContext } from "../context/AuthContext";

export const RegistroPlantaPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Detectamos si es una planta existente o nueva
  const plantaId = state?.plantaId;
  const esSoloUbicacion = state?.vieneDeDetalle;

  // Estados del formulario
  const [nombreLocal, setNombreLocal] = useState(state?.nombreComun || "");
  const [cargando, setCargando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [foto, setFoto] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lng: null });

  // Captura de GPS al montar
  useEffect(() => {
    const obtenerGPS = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("GPS no disponible:", err.message),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    };
    obtenerGPS();
  }, []);

  const manejarEnvio = async (e) => {
    // Evita recargas accidentales
    if (e) e.preventDefault();
    // Si falta algo, no hacemos nada (el botón ya estará visualmente avisando)
    if (!foto || !coords.lat || (!nombreLocal && !esSoloUbicacion)) return;

    setCargando(true);
    try {
      // 1. Subir imagen a Cloudinary
      // Creación de subcarpetas cloudinary Usamos el nombre local o el que viene por state si ya existía
      const nombreCarpetaBase = formatearParaDB(nombreLocal);
      const rutaCloudinary = `${nombreCarpetaBase}/ubicaciones`;
      const urlFoto = await uploadImage(foto, rutaCloudinary);

      // 2 SEGURIDAD: Si por algo Cloudinary no devolvió URL, detenemos todo aquí
      if (!urlFoto) {
        throw new Error("La imagen no pudo procesarse. Verifica tu conexión.");
      }

      // 3. OBTENER LUGAR AUTOMÁTICAMENTE
      let datosLugar = { distrito: null, ciudad: null };
      try {
        const res = await obtenerDireccion(coords.lat, coords.lng);
        if (res) datosLugar = res;
      } catch (error) {
        console.warn(
          "No se pudo obtener la dirección, se guardará solo con coordenadas.",error
        );
      }

      // 4. Lógica de Planta (Si es nueva)
      const { idFinal } = await registrarUbicacionCompleta({
        plantaId, // Viene de state (null si es nueva)
        nombreLimpio: formatearParaDB(nombreLocal),
        usuarioId: user?.id, // Del Contexto de Auth
        urlFoto,
        coords,
        datosLugar,
      });

      // ÉXITO: Feedback visual en el botón
      setGuardadoExitoso(true);
      setTimeout(() => {
        navigate(`/planta/${idFinal}`, {
          replace: true,
        });
      }, 2000);
    } catch (error) {
      console.error("Error en registro:", error);
      alert("Error al guardar: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // Protección de ruta
  if (!state) return <Navigate to="/" />;

  return (
    <div style={estilos.pagina}>
      <header style={estilos.header}>
        <Leaf size={40} color={colores.frondoso} style={estilos.iconoHeader} />
        <h1 style={{ ...estilos.titulo, color: colores.bosque }}>
          {esSoloUbicacion ? "AÑADIR UBICACIÓN" : "REGISTRAR PLANTA"}
        </h1>
      </header>

      {/* Cambiamos <main> por <form> para mejor control del envío */}
      <form onSubmit={manejarEnvio} style={estilos.cardForm}>
        <div style={estilos.infoSeccion}>
          {esSoloUbicacion ? (
            <div style={estilos.contenedorTexto}>
              <span style={estilos.label}>PLANTA SELECCIONADA:</span>
              <h2 style={estilos.nombreFijo}>{nombreLocal.toUpperCase()}</h2>
              <OtrosNombres lista={state?.nombresSecundarios} />
            </div>
          ) : (
            <div style={estilos.contenedorInput}>
              <label style={estilos.label}>NOMBRE DE LA PLANTA</label>
              <input
                type="text"
                value={nombreLocal}
                onChange={(e) => setNombreLocal(e.target.value)}
                style={estilos.inputGrande}
                required
              />
            </div>
          )}
        </div>

        <label
          style={{
            ...estilos.zonaCamara,
            borderColor: foto ? colores.frondoso : colores.bosque,
          }}
        >
          {foto ? (
            <div style={{ color: colores.frondoso, textAlign: "center" }}>
              <CheckCircle size={50} color={colores.frondoso} />
              <p style={{ fontWeight: "bold" }}>FOTO CAPTURADA</p>
            </div>
          ) : (
            <div style={{ color: colores.bosque, textAlign: "center" }}>
              <Camera size={50} color={colores.bosque} />
              <p>TOCAR PARA TOMAR FOTO</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFoto(e.target.files[0])}
            style={{ display: "none" }}
          />
        </label>

        {/* VALIDACIONES VISUALES CON REACT-ICONS */}
        <div style={estilos.contenedorValidacion}>
          {/* Fila Imagen */}
          <div style={estilos.filaValidacion}>
            <div style={estilos.iconoContenedor}>
              {foto ? (
                <IoMdCheckmarkCircle size={22} color={colores.frondoso} />
              ) : (
                <IoMdCloseCircle size={22} color="#F44336" />
              )}
            </div>
            <span style={{ color: foto ? "#333" : "#888" }}>
              Captura de imagen
            </span>
          </div>

          {/* Fila GPS */}
          <div style={estilos.filaValidacion}>
            <div style={estilos.iconoContenedor}>
              {coords.lat ? (
                <IoMdCheckmarkCircle size={22} color={colores.frondoso} />
              ) : (
                <IoMdCloseCircle size={22} color="#F44336" />
              )}
            </div>
            <span style={{ color: coords.lat ? "#333" : "#888" }}>
              Señal GPS establecida
            </span>
          </div>
        </div>

        <BotonPrincipal
          type="submit"
          texto="FINALIZAR REGISTRO"
          textoCargando="GUARDANDO..."
          textoExitoso="REGISTRO EXITOSO"
          estaCargando={cargando}
          esExitoso={guardadoExitoso}
          disabled={
            cargando ||
            guardadoExitoso ||
            !coords.lat ||
            !foto ||
            (!nombreLocal && !esSoloUbicacion)
          }
        />

        <div style={{ marginTop: "12px" }}>
          <BotonCancelar />
        </div>
      </form>
    </div>
  );
};;

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: colores.fondo,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    //justifyContent: "center",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    margin: "20px 0",
  },

  titulo: {
    fontSize: "1.5rem",
    fontWeight: "650",
    letterSpacing: "2px",
  },

  cardForm: {
    backgroundColor: colores.white,
    width: "100%",
    maxWidth: "330px",
    borderRadius: "25px",
    padding: "25px",
    textAlign: "center",
    boxShadow: "8px 2px 20px rgba(0,0,0,0.15)",
  },

  label: {
    fontSize: "0.85rem",
    color: colores.bosque,
    fontWeight: "bold",
    marginLeft: "5px",
    letterSpacing: "0.5px",
  },

  inputGrande: {
    width: "100%",
    padding: "15px 20px", // Más grande (padding generoso)
    fontSize: "1.2rem", // Letra más grande
    fontWeight: "600",
    color: colores.bosque, // Color de letra solicitado
    backgroundColor: "#fff",
    border: `2px solid ${colores.bosque}`, // Borde con el color del tema
    borderRadius: "15px", // Mucho más redondeado
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)", // Un toque de sombra para profundidad
  },

  infoSeccion: {
    marginBottom: "30px",
    width: "100%",
  },

  nombrePlanta: {
    margin: "5px 0 0 0",
    fontSize: "1.2rem",
  },

  zonaCamara: {
    width: "100%",
    height: "200px",
    border: `2px dashed ${colores.frondoso}`,
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: colores.white,
    marginBottom: "20px",
    color: "#1b3d18",
    fontWeight: "bold",
  },
  contenedorInput: {
    display: "flex",
    flexDirection: "column",
    gap: "8px", // Espacio entre la etiqueta y el input
    textAlign: "left",
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

  nombreFijo: {
    color: colores.frondoso,
    fontSize: "1.6rem",
    fontWeight: "700",
    margin: "5px 0",
  },

  contenedorValidacion: {
    backgroundColor: colores.white,
    padding: "15px 20px",
    borderRadius: "18px",
    marginBottom: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%", // Ocupa todo el ancho disponible
    boxSizing: "border-box", // Evita que el padding desborde el ancho
    textAlign: "left", // ⬅️ CRUCIAL: Fuerza el texto a la izquierda
  },

  filaValidacion: {
    display: "flex",
    alignItems: "center", // Centra verticalmente icono y texto
    justifyContent: "flex-start", // ⬅️ Alinea el contenido al inicio (izquierda)
    gap: "10px",
  },
  iconoContenedor: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px", // Mantiene los iconos alineados en una columna invisible
  },
};