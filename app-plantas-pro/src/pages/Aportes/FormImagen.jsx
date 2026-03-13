import { useState, useRef, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { uploadImage } from "../../helpers/cloudinaryHelper";
import { formatearParaDB } from "../../helpers/textHelper";
import { GuiaRegistro } from "../Registro/GuiaRegistro";
import {
  IoMdCheckmarkCircle,
  IoMdCloseCircle,
  IoMdInformationCircle,
} from "react-icons/io";
import { HiSparkles } from "react-icons/hi"; // Icono para "Alta Calidad"
import { TbCamera, TbTrash } from "react-icons/tb";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { logService } from "../../services/logService";
import "./FormImagen.css";

export const FormImagen = ({
  plantaId,
  nombrePlanta,
  conteoActual,
  onCancel,
}) => {
  const { user } = useContext(AuthContext);
  const [etiquetaFoto, setEtiquetaFoto] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const fileInputRef = useRef(null);

  // Lógica de "Reto de Calidad"
  const tiene3oMas =
    etiquetaFoto && conteoActual && conteoActual[etiquetaFoto] >= 3;
  const tieneFotoReal = !!archivo;
  const formularioValido = tieneFotoReal && etiquetaFoto && !enviando;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const manejarEnvio = async (e) => {
    if (e) e.preventDefault();
    if (!formularioValido) return;
    setEnviando(true);

    try {
      const folderPath = `${formatearParaDB(nombrePlanta)}/${etiquetaFoto}`;
      const urlFoto = await uploadImage(archivo, folderPath);
      if (!urlFoto) throw new Error("Error al subir la imagen.");

      await logService.enviarAporte({
        plantaId: Number(plantaId),
        nombrePlanta,
        usuarioId: user?.id,
        alias: user?.alias || "Usuario Ozain",
        grupoId: user?.grupo_id || "Sin grupo",
        grupo: user?.grupo || "Sin grupo",
        tipoAccion: "nueva_imagen",
        contenidoJSON: { categoria: etiquetaFoto, url: urlFoto },
      });

      setExito(true);
      setTimeout(() => onCancel(), 1800);
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  const categoriasBotánicas = [
    { id: "perfil", label: "Perfil" },
    { id: "hoja", label: "Hoja" },
    { id: "flor", label: "Flor" },
    { id: "tallo", label: "Tallo" },
    { id: "fruto", label: "Fruto" },
    { id: "semilla", label: "Semilla" },
    { id: "raiz", label: "Raíz" },
  ];

  return (
    <div className="registro-page-container">
      <GuiaRegistro flujo="nueva imagen" />
      <form onSubmit={manejarEnvio} className="registro-card">
        <div className="registro-section">
          <div className="oz-display-name">{nombrePlanta?.toUpperCase()}</div>
        </div>

        {/* 1. SELECCIÓN DE CATEGORÍA */}
        <div className="registro-section">
          <label className="registro-label">
            1. ¿QUÉ PARTE VAS A FOTOGRAFIAR?
          </label>
          <div className="oz-category-tabs">
            {categoriasBotánicas.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`oz-tab-item ${etiquetaFoto === cat.id ? "active" : ""}`}
                onClick={() => setEtiquetaFoto(cat.id)}
              >
                <span className="oz-tab-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. VISOR DE IMAGEN */}
        <div className="registro-section">
          <label className="registro-label">2. CAPTURA O SUBE TU FOTO</label>
          <div
            className={`oz-visor-container ${tieneFotoReal ? "has-photo" : ""}`}
          >
            {!preview ? (
              <div
                className="oz-drop-area"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="oz-cam-circle">
                  <TbCamera size={32} />
                </div>
                <p>CARGAR IMAGEN</p>
              </div>
            ) : (
              <div className="oz-preview-wrapper">
                <img src={preview} alt="Aporte" className="oz-img-botanica" />
                <div className="oz-visor-overlay">
                  <div className="oz-visor-badge">
                    {etiquetaFoto ? etiquetaFoto.toUpperCase() : "ELEGIR PARTE"}
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
                      onClick={() => {
                        setArchivo(null);
                        setPreview(null);
                      }}
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
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* 3. ESTADO DEL APORTE Y VALIDACIONES */}
        <div className="registro-section">
          <div className="registro-validaciones">
            <div className="val-item">
              {etiquetaFoto ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>Parte seleccionada</span>
            </div>

            <div className="val-item">
              {tieneFotoReal ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>Imagen lista</span>
            </div>

            {/* 🟢 VALIDACIÓN DE CUPO Y CALIDAD */}
            <div className="val-item">
              {!etiquetaFoto ? (
                <>
                  <IoMdInformationCircle color="#94a3b8" />
                  <span style={{ color: "#94a3b8" }}>
                    Selecciona parte para ver estado
                  </span>
                </>
              ) : tiene3oMas ? (
                <>
                  <HiSparkles color="#f59e0b" />
                  <span style={{ color: "#b45309", fontWeight: "700" }}>
                    Reto: Mejorar fotos actuales
                  </span>
                </>
              ) : (
                <>
                  <IoMdCheckmarkCircle color="#2d6a4f" />
                  <span style={{ color: "#2d6a4f", fontWeight: "700" }}>
                    ¡Se necesitan fotos aquí!
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Banner explicativo según el estado */}
          {etiquetaFoto && (
            <div className="status-banner-wrapper">
              {tiene3oMas ? (
                <StatusBanner
                  status="warning"
                  message="Esta parte ya tiene 3 fotos. Tu aporte solo será aceptado si es más nítido, detallado o mejor iluminado que los actuales."
                />
              ) : (
                <StatusBanner
                  status="success"
                  message="¡Genial! Aún faltan fotos en esta categoría. Tu aporte ayudará mucho a completar la ficha."
                />
              )}
            </div>
          )}
        </div>

        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto={enviando ? "ENVIANDO..." : "ENVIAR APORTE"}
            estaCargando={enviando}
            esExitoso={exito}
            disabled={!formularioValido}
          />
          <div className="boton-cancelar-wrapper" onClick={onCancel}>
            <BotonCancelar texto="CANCELAR" variante="azul-slate-claro" />
          </div>
        </div>
      </form>
    </div>
  );
};
