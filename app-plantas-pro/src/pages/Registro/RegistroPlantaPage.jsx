import { useState, useContext, useMemo, useEffect } from "react";
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
  registrarPropuestaImagen,
  checkNombreExistente,
} from "../../services/plantasServices";
import { uploadImage } from "../../helpers/cloudinaryHelper";
import { formatearParaDB } from "../../helpers/textHelper";
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
import { PiPlantFill, PiGpsFixFill } from "react-icons/pi";
import { GiEarthAmerica, GiAfrica } from "react-icons/gi";
import "./Registro.css";

const OPCIONES_PAISES = [
  { label: "Nombre global (Internacional)", value: "world" },
  { label: "Nombre sagrado", value: "sacred" },
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

  const { cargarPlantasHome } = useContext(PlantasContext);
  const { coords, cargandoGPS, errorGPS } = useGPS();

  const plantaId = state?.plantaId || null;
  const esNuevaPlanta = !plantaId;
  const esStaff = user?.rol === "Administrador" || user?.rol === "Colaborador";

  const esImagenTecnica = !!state?.esImagenTecnica && esStaff;
  const esAgregarDetalle =
    !!state?.esDetalleStaff && esStaff && !esImagenTecnica;
  const esSoloUbicacion = !!plantaId && !esAgregarDetalle && !esImagenTecnica;

  const [nombreLocal, setNombreLocal] = useState(
    plantaId
      ? state?.nombres_planta?.[0]
      : state?.nombreComun || state?.busqueda || "",
  );
  const [nuevoNombreSecundario, setNuevoNombreSecundario] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState("");
  const [etiquetaFoto, setEtiquetaFoto] = useState("hoja");
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [nombreDuplicadoDB, setNombreDuplicadoDB] = useState(false);
  const [validacionNombre, setValidacionNombre] = useState({
    status: null,
    message: "",
  });

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

  useEffect(() => {
    if (!esNuevaPlanta) return;
    const nombreATestear = nombreLocal.trim();
    if (nombreATestear.length < 2) {
      setNombreDuplicadoDB(false);
      setValidacionNombre({ status: null, message: "" });
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const existe = await checkNombreExistente(nombreATestear);
        setNombreDuplicadoDB(existe);
        if (existe) {
          setValidacionNombre({
            status: "error",
            message: "El sistema detectó que esta planta ya existe.",
          });
        } else {
          setValidacionNombre({
            status: "success",
            message: "¡Nombre disponible!",
          });
        }
      } catch (error) {
        console.error("Error en validación:", error);
      }
    }, 900);
    return () => clearTimeout(timeoutId);
  }, [nombreLocal, esNuevaPlanta]);

  const tieneFotoReal = foto instanceof File;
  const gpsListo = coords?.lat && coords?.lng && !cargandoGPS;

  const formularioInvalido = useMemo(() => {
    if (cargando || guardadoExitoso) return true;
    if (!esAgregarDetalle && !tieneFotoReal) return true;
    if (esNuevaPlanta) {
      return nombreLocal.trim().length < 2 || nombreDuplicadoDB;
    }
    if (esSoloUbicacion) return !gpsListo || validacionDistancia.bloquear;
    if (esAgregarDetalle) return !nuevoNombreSecundario.trim();
    return false;
  }, [
    cargando,
    guardadoExitoso,
    tieneFotoReal,
    esNuevaPlanta,
    nombreLocal,
    nombreDuplicadoDB,
    esSoloUbicacion,
    gpsListo,
    validacionDistancia.bloquear,
    esAgregarDetalle,
    nuevoNombreSecundario,
  ]);

  const manejarEnvio = async (e) => {
    if (e) e.preventDefault();
    if (formularioInvalido) return;
    setCargando(true);

    try {
      if (esNuevaPlanta) {
        const checkFinal = await checkNombreExistente(nombreLocal);
        if (checkFinal) {
          setNombreDuplicadoDB(true);
          setValidacionNombre({
            status: "error",
            message: "Error: Se acaba de registrar este nombre.",
          });
          setCargando(false);
          return;
        }
      }

      let urlFoto = null;
      let plantaIdFinal = plantaId;

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

      if (esNuevaPlanta) {
        const nueva = await crearEspecieNueva(
          nombreLocal,
          urlFoto,
          user?.id,
          user?.alias,
          paisSeleccionado,
          user?.grupo_id,
        );
        plantaIdFinal = nueva.id;
      } else if (esSoloUbicacion) {
        const resLugar = await obtenerDireccion(coords.lat, coords.lng);
        await agregarUbicacion(
          plantaId,
          user?.id,
          coords,
          urlFoto,
          resLugar,
          nombreLocal,
          user?.alias,
          user?.grupo_id,
          user?.grupos?.nombre_grupo,
        );
      } else if (esAgregarDetalle) {
        await agregarDetalleStaff(
          plantaId,
          formatearParaDB(nuevoNombreSecundario),
          paisSeleccionado,
          user,
          nombreLocal,
        );
      } else if (esImagenTecnica) {
        await registrarPropuestaImagen(
          plantaId,
          user.id,
          urlFoto,
          etiquetaFoto,
          nombreLocal,
          user?.alias,
          user?.grupo_id,
        );
      }

      await cargarPlantasHome();
      setGuardadoExitoso(true);
      setTimeout(
        () => navigate(`/planta/${plantaIdFinal}`, { replace: true }),
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
                className={`registro-input-text ${nombreDuplicadoDB ? "input-error" : ""}`}
                value={esAgregarDetalle ? nuevoNombreSecundario : nombreLocal}
                onChange={(e) =>
                  esAgregarDetalle
                    ? setNuevoNombreSecundario(e.target.value)
                    : setNombreLocal(e.target.value)
                }
                disabled={cargando || guardadoExitoso}
                placeholder="Ej: Piñón de botija"
              />

              {validacionNombre.status && (
                <div className="status-banner-wrapper">
                  <StatusBanner
                    status={validacionNombre.status}
                    message={validacionNombre.message}
                  />
                </div>
              )}

              <div className="registro-section">
                <label className="registro-label">TIPO DE NOMBRE / PAÍS</label>
                <select
                  className="registro-input-text"
                  value={paisSeleccionado}
                  onChange={(e) => setPaisSeleccionado(e.target.value)}
                >
                  <option value="" disabled>
                    ¿Dónde se usa este nombre?
                  </option>
                  {OPCIONES_PAISES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {nombreLocal.trim().length > 0 && paisSeleccionado && (
                  <div className="registro-section animation-fadeIn">
                    <label className="registro-label">
                      TIP DE NOMBRE / PAÍS
                    </label>
                    <div className="info-formada-container">
                      <div className="info-formada-icon">
                        {paisSeleccionado === "world" && (
                          <GiEarthAmerica size={24} />
                        )}
                        {paisSeleccionado === "sacred" && (
                          <GiAfrica size={24} />
                        )}
                        {!["world", "sacred"].includes(paisSeleccionado) && (
                          <PiGpsFixFill size={24} />
                        )}
                      </div>
                      <div className="info-formada-texto">
                        {/* USAMOS LA FUNCIÓN AQUÍ PARA LA VISTA PREVIA */}
                        <span className="info-formada-nombre">
                          {formatearParaDB(nombreLocal)}
                        </span>
                        <span className="info-formada-detalle">
                          {
                            OPCIONES_PAISES.find(
                              (op) => op.value === paisSeleccionado,
                            )?.label
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <label className="registro-label">PLANTA SELECCIONADA</label>
              <h2 className="nombre-fijo-display">
                {nombreLocal.toUpperCase()}
              </h2>
              {esImagenTecnica && (
                <div className="registro-section">
                  <label className="registro-label">PARTE DE LA PLANTA</label>
                  <select
                    className="registro-input-text"
                    value={etiquetaFoto}
                    onChange={(e) => setEtiquetaFoto(e.target.value)}
                  >
                    {TIPOS_FOTO.filter((t) => t.value !== "perfil").map(
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

        {!esAgregarDetalle && (
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
        )}

        {esSoloUbicacion && (
          <>
            {/* Contenedor de Checklists (Foto y GPS) */}
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
            </div>

            {/* EL BANNER AHORA VIVE AQUÍ AFUERA */}
            {gpsListo && (
              <div
                className="status-banner-wrapper"
                style={{ marginTop: "12px" }}
              >
                <StatusBanner
                  status={validacionDistancia.status}
                  message={validacionDistancia.message}
                />
              </div>
            )}
          </>
        )}

        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto="FINALIZAR REGISTRO"
            estaCargando={cargando}
            esExitoso={guardadoExitoso}
            disabled={formularioInvalido}
          />
          <div className="boton-cancelar-wrapper">
            <BotonCancelar />
          </div>
        </div>
      </form>
    </div>
  );
};
