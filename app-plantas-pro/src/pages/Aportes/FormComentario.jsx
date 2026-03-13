import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { logService } from "../../services/logService";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import { GuiaRegistro } from "../Registro/GuiaRegistro";
import "./FormComentario.css";

export const FormComentario = ({ plantaId, nombrePlanta, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
console.log(nombrePlanta)
  // Validaciones: Solo dependemos de que el texto sea válido
  const comentarioValido = comentario.trim().length >= 10;
  const formularioValido = comentarioValido && !enviando;

  const manejarEnvio = async (e) => {
    if (e) e.preventDefault();
    if (!formularioValido) return;

    setEnviando(true);

    try {
      const objetoContenido = {
        tipo: "comentario_general",
        texto: comentario.trim(),
      };

      // 🟢 USAMOS EL SERVICIO CENTRALIZADO CON BYPASS DE ETAPA 1
      await logService.enviarAporte({
        plantaId: Number(plantaId),
        nombrePlanta,
        usuarioId: user?.id,
        alias: user?.alias || "Usuario Ozain",
        grupoId: user?.grupo_id || "Sin grupo",
        grupo: user?.grupos?.nombre_grupo || "Sin grupo", // Corregido el user?.grupos
        tipoAccion: "nuevo_comentario",
        contenidoJSON: objetoContenido,
        estadoRevisado: "aprobado", // 🚨 EL BYPASS MAGICO
        mensajeRevisado: "Autoverificado (Aporte Directo).", // 🚨 MENSAJE INICIAL
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
      {/* Usamos el flujo de saberes que redactamos en la guía */}
      <GuiaRegistro flujo="nuevo comentario" />

      <form onSubmit={manejarEnvio} className="registro-card">
        <div className="registro-section">
          <div className="oz-display-name">{nombrePlanta?.toUpperCase()}</div>
        </div>

        {/* Campo Único: El Contenido del Aporte */}
        <div className="registro-section">
          <label className="registro-label">TU APORTE O SUGERENCIA</label>
          <textarea
            className="registro-input-text"
            style={{ minHeight: "150px", resize: "none", paddingTop: "12px" }}
            placeholder="Escribe tu comentario sobre esta planta..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={enviando || exito}
          />
        </div>

        {/* Validaciones Visuales */}
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
          </div>
        </div>

        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto={enviando ? "ENVIANDO..." : "PUBLICAR DATO"}
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
