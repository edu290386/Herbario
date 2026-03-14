import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { logService } from "../../services/logService";
import { uploadImage } from "../../helpers/cloudinaryHelper";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import { TbCamera, TbTrash } from "react-icons/tb"; // <-- Usamos los iconos de tu visor
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import { GuiaRegistro } from "../Registro/GuiaRegistro";
import "./FormComentario.css";

export const FormComentario = ({
  plantaId,
  nombrePlanta,
  onCancel,
  ubicacionRef = null,
  distritoRef = null,
}) => {
  const { user } = useContext(AuthContext);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  // Estados para la foto
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const esReporte = Boolean(ubicacionRef);
  const comentarioValido = comentario.trim().length >= 10;
  const tieneFotoReal = !!archivo;
  const formularioValido = comentarioValido && !enviando; // La foto sigue siendo opcional

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const quitarFoto = () => {
    setArchivo(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const manejarEnvio = async (e) => {
    if (e) e.preventDefault();
    if (!formularioValido) return;

    setEnviando(true);

    try {
      let urlCloudinary = null;

      // 1. Si el usuario puso una foto, la subimos a Cloudinary
      if (archivo) {
        const carpetaDestino = esReporte ? "reportes" : "otros_registros";
        urlCloudinary = await uploadImage(archivo, carpetaDestino);
        if (!urlCloudinary)
          throw new Error("Error al subir la imagen adjunta.");
      }

      const objetoContenido = {
        tipo: esReporte ? "reporte_ubicacion" : "comentario_general",
        texto: comentario.trim(),
        ...(urlCloudinary && { url: urlCloudinary }),
        ...(esReporte && {
          ref_ubi: ubicacionRef,
          distrito_reportado: distritoRef,
        }),
      };

      // 2. Enviamos a Supabase
      await logService.enviarAporte({
        plantaId: Number(plantaId),
        nombrePlanta,
        usuarioId: user?.id,
        alias: user?.alias || "Usuario Ozain",
        grupoId: user?.grupo_id || "Sin grupo",
        grupo: user?.grupos?.nombre_grupo || "Sin grupo",
        tipoAccion: "nuevo_comentario",
        contenidoJSON: objetoContenido,
        estadoRevisado: "aprobado",
        mensajeRevisado: "Autoverificado (Aporte Directo).",
      });

      setExito(true);
      setTimeout(() => onCancel(), 1800);
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      alert("Error: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="registro-page-container">
      <GuiaRegistro
        flujo={esReporte ? "reporte ubicación" : "nuevo comentario"}
      />

      <form onSubmit={manejarEnvio} className="registro-card">
        <div className="registro-section">
          <div className="oz-display-name">
            {esReporte
              ? `REPORTE: ${nombrePlanta?.toUpperCase()}`
              : nombrePlanta?.toUpperCase()}
          </div>
          {esReporte && distritoRef && (
            <p
              style={{
                textAlign: "center",
                fontSize: "0.85rem",
                color: "#666",
                marginTop: "4px",
              }}
            >
              En {distritoRef}
            </p>
          )}
        </div>

        <div className="registro-section">
          <label className="registro-label">
            {esReporte ? "MOTIVO DEL REPORTE" : "TU APORTE O SUGERENCIA"}
          </label>
          <textarea
            className="registro-input-text"
            placeholder={
              esReporte
                ? "Ej: Fui a este lugar y el terreno está vacío..."
                : "Escribe tu comentario sobre esta planta..."
            }
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={enviando || exito}
          />
        </div>

        {/* ================= VISOR DE FOTO OPCIONAL (Estilo FormImagen) ================= */}
        <div className="registro-section">
          <label className="registro-label">ADJUNTAR FOTO (OPCIONAL)</label>
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
                <span>Sube una foto de evidencia</span>
              </div>
            ) : (
              <div className="oz-preview-wrapper">
                <img src={preview} alt="Aporte" className="oz-img-botanica" />
                <div className="oz-visor-overlay">
                  <div className="oz-visor-badge">
                    {esReporte ? "REPORTE" : "APORTE"}
                  </div>
                  <div className="oz-visor-actions">
                    <button
                      type="button"
                      className="oz-action-btn"
                      onClick={() => fileInputRef.current.click()}
                      disabled={enviando || exito}
                    >
                      <TbCamera size={20} />
                    </button>
                    <button
                      type="button"
                      className="oz-action-btn delete"
                      onClick={quitarFoto}
                      disabled={enviando || exito}
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
              disabled={enviando || exito}
            />
          </div>
        </div>
        {/* ========================================================================= */}

        <div className="registro-section">
          <div className="registro-validaciones">
            <div className="val-item">
              {comentarioValido ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>Contenido mínimo (10 caracteres)</span>
            </div>
            <div className="val-item">
              {tieneFotoReal ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCheckmarkCircle color="#94a3b8" /> // Gris porque es opcional
              )}
              <span style={{ color: tieneFotoReal ? "#2d6a4f" : "#94a3b8" }}>
                {tieneFotoReal ? "Evidencia adjuntada (opcional)" : "Evidencia (opcional)"}
              </span>
            </div>
          </div>
        </div>

        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto={
              enviando
                ? "ENVIANDO..."
                : esReporte
                  ? "ENVIAR REPORTE"
                  : "PUBLICAR DATO"
            }
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
