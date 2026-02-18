import { useState, useContext, useMemo } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
// Contextos, Hooks y Helpers
import { AuthContext } from "../../context/AuthContext";
import { PlantasContext } from "../../context/PlantasContext";
import { useGPS } from "../../hooks/useGPS";
import { useUbicacionesPlanta } from "../../hooks/useUbicacionesPlanta";
import {
  validarProximidadGlobal,
  obtenerDireccion,
} from "../../helpers/geoHelper";
import {
  crearEspecieNueva,
  agregarUbicacion,
  agregarDetalleStaff,
} from "../../services/plantasServices";
import { uploadImage } from "../../helpers/cloudinaryHelper";
import {
  normalizarParaBusqueda,
  formatearParaDB,
} from "../../helpers/textHelper";
// UI e Iconos
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { GuiaRegistro } from "./GuiaRegistro";
import {
  IoIosCamera,
  IoMdCheckmarkCircle,
  IoMdCloseCircle,
} from "react-icons/io";
import { PiPlantFill } from "react-icons/pi";
import "./Registro.css";
import { registrarPropuestaImagen } from "../../services/plantasServices";

const OPCIONES_PAISES = [
  { label: "Mundial (World)", value: "world" },
  { label: "Sagrado (Sacred)", value: "sacred" },
  { label: "Perú", value: "PE" },
  { label: "Venezuela", value: "VE" },
  { label: "Cuba", value: "CU" },
  { label: "Colombia", value: "CO" },
  { label: "México", value: "MX" },
];

const TIPOS_FOTO = [
  { label: "Foto de Perfil", value: "perfil" },
  { label: "Hoja", value: "hoja" },
  { label: "Tallo", value: "tallo" },
  { label: "Flor", value: "flor" },
  { label: "Fruto", value: "fruto" },
  { label: "Semilla", value: "semilla" },
  { label: "Raíz", value: "raiz" },
];

export const RegistroPlantaPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { plantas, actualizarPlantasTrasRegistro } = useContext(PlantasContext);
  const { coords, cargandoGPS, errorGPS } = useGPS();

  // --- 1. CONFIGURACIÓN DE FLUJOS ---
  const plantaId = state?.plantaId || null;
  const esNuevaPlanta = !plantaId;
  const esStaff = user?.rol === "Administrador" || user?.rol === "Colaborador";

  // Nuevo: Detectar si es el flujo de imagen técnica desde el botón de Detalle
  const esImagenTecnica = !!state?.esImagenTecnica && esStaff;
  const esAgregarDetalle =
    !!state?.esDetalleStaff && esStaff && !esImagenTecnica;
  const esSoloUbicacion = !!plantaId && !esAgregarDetalle && !esImagenTecnica;

  // --- 2. ESTADOS DEL FORMULARIO ---
  const [nombreLocal, setNombreLocal] = useState(
    plantaId
      ? state?.nombres_planta?.[0]
      : state?.nombreComun || state?.busqueda || "",
  );
  const [nuevoNombreSecundario, setNuevoNombreSecundario] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState("PE");
  const [etiquetaFoto, setEtiquetaFoto] = useState("hoja"); // Para fotos técnicas
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // --- 3. LÓGICA DE GEOLOCALIZACIÓN ---
  const { coordsExistentes } = useUbicacionesPlanta(plantaId);

  const validacionDistancia = useMemo(() => {
    if (coords?.lat && coords?.lng && !cargandoGPS) {
      return validarProximidadGlobal(coords, coordsExistentes);
    }
    return {
      status: "warning",
      message: "Esperando señal GPS...",
      bloquear: true,
    };
  }, [coords, coordsExistentes, cargandoGPS]);

  // --- 4. VALIDACIONES ---
  const tieneFotoReal = foto instanceof File;
  const gpsListo = coords?.lat && coords?.lng && !cargandoGPS;

  const existeCoincidencia =
    esNuevaPlanta &&
    plantas.some((p) =>
      p.nombres_planta?.some(
        (n) =>
          normalizarParaBusqueda(n) === normalizarParaBusqueda(nombreLocal),
      ),
    );

  const formularioInvalido = useMemo(() => {
    if (cargando || guardadoExitoso) return true;
    if (!tieneFotoReal) return true;
    if (esNuevaPlanta) return !nombreLocal.trim() || existeCoincidencia;
    if (esSoloUbicacion) return !gpsListo || validacionDistancia.bloquear;
    if (esAgregarDetalle) return !nuevoNombreSecundario.trim();
    if (esImagenTecnica) return false; // Solo requiere foto
    return false;
  }, [
    cargando,
    guardadoExitoso,
    tieneFotoReal,
    esNuevaPlanta,
    nombreLocal,
    existeCoincidencia,
    esSoloUbicacion,
    gpsListo,
    validacionDistancia.bloquear,
    esAgregarDetalle,
    nuevoNombreSecundario,
    esImagenTecnica,
  ]);

  // --- 5. MANEJADOR DE ENVÍO ---
  const manejarEnvio = async (e) => {
    if (e) e.preventDefault();
    if (formularioInvalido) return;

    setCargando(true);
    try {
      let urlFoto = null;
      let plantaFinal = null;
      let nuevaUbi = null;

      // Subida de imagen
      if (tieneFotoReal) {
        const nombreCarpetaRaiz = formatearParaDB(nombreLocal);
        const subCarpetaDinamica = esImagenTecnica
          ? etiquetaFoto
          : esSoloUbicacion
            ? "ubicaciones"
            : "perfil";
        urlFoto = await uploadImage(
          foto,
          `${nombreCarpetaRaiz}/${subCarpetaDinamica}`,
        );
      }

      // Lógica por flujo
      if (esNuevaPlanta) {
        plantaFinal = await crearEspecieNueva(
          formatearParaDB(nombreLocal), // 1. nombre
          urlFoto, // 2. fotoUrl
          user?.id, // 3. usuarioId
          user?.alias, // 4. alias
          paisSeleccionado, // 5. pais
          user?.grupo_id, // 6. grupoId (¡NUEVO!)
        );
      } else if (esSoloUbicacion) {
        const resLugar = await obtenerDireccion(coords.lat, coords.lng);
        // Buscamos la planta en tu estado para obtener su nombre para el Log
        const plantaEncontrada = plantas.find((p) => p.id === plantaId);
        nuevaUbi = await agregarUbicacion(
          plantaId, // 1. plantaId
          user?.id, // 2. usuarioId
          coords, // 3. coords
          urlFoto, // 4. fotoUrl
          resLugar, // 5. datosLugar
          plantaEncontrada?.nombres_planta?.[0] || nombreLocal, // 6. nombrePlanta (¡NUEVO!)
          user?.alias, // 7. alias
          user?.grupo_id, // 8. grupoId (¡NUEVO!)
        );

        plantaFinal = plantaEncontrada;
      } else if (esAgregarDetalle) {
        plantaFinal = await agregarDetalleStaff(
          plantaId,
          formatearParaDB(nuevoNombreSecundario),
          paisSeleccionado,
        );
      } else if (esImagenTecnica) {
        // Registro en la tabla de LOGS (No actualiza 'plantas')
        await registrarPropuestaImagen(
          plantaId,
          user.id,
          urlFoto,
          etiquetaFoto,
          nombreLocal,
          user?.alias,
          user?.grupo_id,
        );
        plantaFinal = plantas.find((p) => p.id === plantaId);
      }

      if (!esImagenTecnica) {
        const dataParaContexto = { ...plantaFinal, ultima_ubicacion: nuevaUbi };
        actualizarPlantasTrasRegistro(dataParaContexto);
      }

      setGuardadoExitoso(true);
      setTimeout(
        () =>
          navigate(`/planta/${plantaId || plantaFinal.id}`, { replace: true }),
        1500,
      );
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  if (!state) return <Navigate to="/" />;

  return (
    <div className="registro-page-container">
      <header className="registro-header">
        <PiPlantFill size={45} color="var(--color-frondoso)" />
        <h1 className="registro-titulo">
          {esNuevaPlanta && "REGISTRAR PLANTA"}
          {esSoloUbicacion && "AÑADIR UBICACIÓN"}
          {esAgregarDetalle && "AGREGAR DETALLE"}
          {esImagenTecnica && "IMAGEN TÉCNICA"}
        </h1>
      </header>

      <GuiaRegistro
        flujo={
          esNuevaPlanta
            ? "nueva planta"
            : esSoloUbicacion
              ? "solo ubicacion"
              : esImagenTecnica
                ? "imagen tecnica"
                : "agregar detalle"
        }
      />

      <form onSubmit={manejarEnvio} className="registro-card">
        <div className="registro-section">
          {esNuevaPlanta || esAgregarDetalle ? (
            <>
              <label className="registro-label">
                {esNuevaPlanta ? "NOMBRE DE LA PLANTA" : "AÑADIR NOMBRE EXTRA"}
              </label>
              <input
                type="text"
                className="registro-input-text"
                value={esAgregarDetalle ? nuevoNombreSecundario : nombreLocal}
                onChange={(e) =>
                  esAgregarDetalle
                    ? setNuevoNombreSecundario(e.target.value)
                    : setNombreLocal(e.target.value)
                }
                disabled={cargando || guardadoExitoso}
              />
              <div style={{ marginTop: "15px" }}>
                <label className="registro-label">NOMBRE EN EL PAÍS</label>
                <select
                  className="registro-input-text"
                  value={paisSeleccionado}
                  onChange={(e) => setPaisSeleccionado(e.target.value)}
                >
                  {OPCIONES_PAISES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <label className="registro-label">PLANTA SELECCIONADA</label>
              <h2 className="nombre-fijo-display">
                {nombreLocal.toUpperCase()}
              </h2>
              {esImagenTecnica && (
                <div style={{ marginTop: "15px" }}>
                  <label className="registro-label">PARTE DE LA PLANTA</label>
                  <select
                    className="registro-input-text"
                    value={etiquetaFoto}
                    onChange={(e) => setEtiquetaFoto(e.target.value)}
                  >
                    {TIPOS_FOTO.filter((t) => t.value !== "foto_perfil").map(
                      (opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        <div className="registro-section">
          <label className="registro-label">
            {esSoloUbicacion ? "FOTO DE LA UBICACIÓN" : "FOTO DE REFERENCIA"}
          </label>
          <label
            className={`registro-zona-foto ${tieneFotoReal ? "foto-ok" : ""}`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0])}
              style={{ display: "none" }}
            />
            {tieneFotoReal ? (
              <IoMdCheckmarkCircle size={60} color="var(--color-frondoso)" />
            ) : (
              <IoIosCamera size={60} />
            )}
            <p>{tieneFotoReal ? "FOTO CARGADA" : "TOCAR PARA CARGAR"}</p>
          </label>
        </div>

        {esSoloUbicacion && (
          <div className="registro-validaciones">
            <div className="val-item">
              {tieneFotoReal ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>Foto obligatoria</span>
            </div>
            <div className="val-item">
              {gpsListo ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>
                {cargandoGPS
                  ? "Buscando GPS..."
                  : gpsListo
                    ? "GPS listo"
                    : errorGPS || "GPS requerido"}
              </span>
            </div>
            {gpsListo && (
              <div style={{ marginTop: "10px", width: "100%" }}>
                <StatusBanner
                  status={validacionDistancia.status}
                  message={validacionDistancia.message}
                />
              </div>
            )}
          </div>
        )}

        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto="FINALIZAR REGISTRO"
            estaCargando={cargando}
            esExitoso={guardadoExitoso}
            disabled={formularioInvalido}
          />
          <div style={{ marginTop: "12px", width: "100%" }}>
            <BotonCancelar />
          </div>
        </div>
      </form>
    </div>
  );
};