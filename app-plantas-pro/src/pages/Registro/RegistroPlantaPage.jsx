import { useState, useContext, useMemo, useEffect, useRef } from "react";
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
  checkNombreExistente,
} from "../../services/plantasServices";
import { uploadImage } from "../../helpers/cloudinaryHelper";
import { formatearParaDB } from "../../helpers/textHelper";

// UI e Iconos
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { GuiaRegistro } from "./GuiaRegistro";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import { TbCamera, TbTrash } from "react-icons/tb";
import { PiPlantFill } from "react-icons/pi";
import { PAISES_CONFIG } from "../../constants/paisesConfig";
import { NombreOficialRow } from "../../components/planta/NombreOficialRow";
import "./Registro.css";

export const RegistroPlantaPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cargarPlantasHome } = useContext(PlantasContext);
  const { coords, cargandoGPS, errorGPS } = useGPS();
  const fileInputRef = useRef(null);

  // Lógica de flujo simplificada
  const plantaId = state?.plantaId || null;
  const esNuevaPlanta = !plantaId;
  const esSoloUbicacion = !!plantaId;

  const [nombreLocal, setNombreLocal] = useState(
    plantaId
      ? state?.nombres_planta?.[0]
      : state?.nombreComun || state?.busqueda || "",
  );

  const [paisSeleccionado, setPaisSeleccionado] = useState("");
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
        setValidacionNombre(
          existe
            ? {
                status: "error",
                message: "El sistema detectó que esta planta ya existe.",
              }
            : { status: "success", message: "¡Nombre disponible!" },
        );
      } catch (error) {
        console.error(error);
      }
    }, 900);
    return () => clearTimeout(timeoutId);
  }, [nombreLocal, esNuevaPlanta]);

  const tieneFotoReal = foto instanceof File;
  const gpsListo = coords?.lat && coords?.lng && !cargandoGPS;

  const formularioInvalido = useMemo(() => {
    if (cargando || guardadoExitoso || !tieneFotoReal) return true;
    if (esNuevaPlanta)
      return (
        nombreLocal.trim().length < 2 || nombreDuplicadoDB || !paisSeleccionado
      );
    if (esSoloUbicacion) return !gpsListo || validacionDistancia.bloquear;
    return false;
  }, [
    cargando,
    guardadoExitoso,
    tieneFotoReal,
    esNuevaPlanta,
    nombreLocal,
    nombreDuplicadoDB,
    paisSeleccionado,
    esSoloUbicacion,
    gpsListo,
    validacionDistancia.bloquear,
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
          setCargando(false);
          return;
        }
      }

      const nombreFormateado = formatearParaDB(nombreLocal);
      const subCarpeta = esSoloUbicacion ? "ubicaciones" : "perfil";
      const urlFoto = await uploadImage(
        foto,
        `${nombreFormateado}/${subCarpeta}`,
      );

      let plantaIdFinal = plantaId;

      if (esNuevaPlanta) {
        const nombresInternacionalesJSON = [
          {
            pais: paisSeleccionado.toUpperCase(),
            nombres: [
              {
                texto: nombreFormateado,
                verificado: true,
                votos_usuarios: [user?.id],
                creado_por: user?.id,
                fecha_registro: new Date().toISOString(),
              },
            ],
          },
        ];
        const nueva = await crearEspecieNueva(
          nombreFormateado,
          urlFoto,
          user?.id,
          user?.alias,
          paisSeleccionado.toUpperCase(),
          user?.grupo_id,
          user?.nombre_grupo,
          [nombreFormateado],
          nombresInternacionalesJSON,
        );
        plantaIdFinal = nueva.id;
      } else {
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
      }

      await cargarPlantasHome(true);
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
      <GuiaRegistro flujo={esNuevaPlanta ? "nueva planta" : "solo ubicacion"} />

      <form onSubmit={manejarEnvio} className="registro-card">
        <div className="registro-section">
          {esNuevaPlanta ? (
            <>
              <label className="registro-label">NOMBRE DE LA PLANTA</label>
              <input
                type="text"
                className={`registro-input-text ${nombreDuplicadoDB ? "input-error" : ""}`}
                value={nombreLocal}
                onChange={(e) => setNombreLocal(e.target.value)}
                placeholder="Ej: Piñón de botija"
              />
              {validacionNombre.status && (
                <StatusBanner
                  status={validacionNombre.status}
                  message={validacionNombre.message}
                />
              )}

              <div className="registro-section">
                <label className="registro-label">PROCEDENCIA DEL NOMBRE</label>
                <select
                  className="registro-input-text"
                  value={paisSeleccionado}
                  onChange={(e) => setPaisSeleccionado(e.target.value)}
                >
                  <option value="" disabled>
                    ¿Dónde se usa este nombre?
                  </option>
                  {PAISES_CONFIG.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                {nombreLocal.trim().length > 1 && paisSeleccionado && (
                  <div className="animation-fadeIn">
                    <label className="registro-label">VISTA PREVIA</label>
                    <NombreOficialRow
                      nombre={formatearParaDB(nombreLocal)}
                      pais={paisSeleccionado}
                      esPreview={true}
                    />
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
            </>
          )}
        </div>

        {/* SECCIÓN FOTO: VISOR INNOVADOR 3:4 */}
        <div className="registro-section">
          <label className="registro-label">FOTO DE REFERENCIA</label>
          <div
            className={`oz-visor-container ${tieneFotoReal ? "has-photo" : ""}`}
          >
            {!tieneFotoReal ? (
              <div
                className="oz-drop-area"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="oz-cam-circle">
                  <TbCamera size={32} />
                </div>
                <p>CARGAR FOTO</p>
                <span>Cámara o Galería</span>
              </div>
            ) : (
              <div className="oz-preview-wrapper">
                <img
                  src={URL.createObjectURL(foto)}
                  alt="Preview"
                  className="oz-img-botanica"
                />
                <div className="oz-visor-overlay">
                  <div className="oz-visor-badge">
                    {esSoloUbicacion ? "UBICACIÓN" : "PERFIL"}
                  </div>
                  <div className="oz-visor-actions">
                    <button
                      type="button"
                      className="oz-action-btn"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <TbCamera size={20} />
                    </button>
                    <button
                      type="button"
                      className="oz-action-btn delete"
                      onClick={() => setFoto(null)}
                    >
                      <TbTrash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setFoto(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* VALIDACIONES UNIFICADAS */}
        <div className="registro-section">
          <div className="registro-validaciones">
            <div className="val-item">
              {tieneFotoReal ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>Foto obligatoria</span>
            </div>

            {esNuevaPlanta ? (
              <>
                <div className="val-item">
                  {nombreLocal.trim().length >= 2 && !nombreDuplicadoDB ? (
                    <IoMdCheckmarkCircle color="#2d6a4f" />
                  ) : (
                    <IoMdCloseCircle color="#f44336" />
                  )}
                  <span>Nombre válido disponible</span>
                </div>
                <div className="val-item">
                  {paisSeleccionado ? (
                    <IoMdCheckmarkCircle color="#2d6a4f" />
                  ) : (
                    <IoMdCloseCircle color="#f44336" />
                  )}
                  <span>Origen del nombre</span>
                </div>
              </>
            ) : (
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
            )}
          </div>
          {esSoloUbicacion && gpsListo && (
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
        </div>

        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto="FINALIZAR REGISTRO"
            estaCargando={cargando}
            esExitoso={guardadoExitoso}
            disabled={formularioInvalido}
          />
          <BotonCancelar />
        </div>
      </form>
    </div>
  );
};
