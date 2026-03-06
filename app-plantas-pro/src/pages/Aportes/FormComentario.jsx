import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
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

  // Validaciones: Solo dependemos de que el texto sea válido
  const comentarioValido = comentario.trim().length >= 10;
  const formularioValido = comentarioValido && !enviando;

  const manejarEnvio = async (e) => {
    if (e) e.preventDefault();
    if (!formularioValido) return;

    setEnviando(true);

    try {
      // 1. PREPARAR EL CONTENIDO JSON (Mantenemos "tipo" por defecto)
      const objetoContenido = {
        tipo: "comentario_general",
        texto: comentario.trim(),
      };

      // 2. INSERTAR EN TABLA LOGS
      const { data: logData, error: errorLog } = await supabase
        .from("logs")
        .insert([
          {
            planta_id: Number(plantaId),
            usuario_id: user?.id,
            nombre_planta: nombrePlanta,
            alias: user?.alias || "Usuario Ozain",
            grupo_id: user?.grupo_id,
            tipo_accion: "nuevo_comentario",
            contenido: objetoContenido,
            revisado: "pendiente",
            auditado: "pendiente",
          },
        ])
        .select()
        .single();

      if (errorLog) throw errorLog;

      // 3. INSERTAR EN TABLA APORTES
      const { error: errorAportes } = await supabase.from("aportes").insert([
        {
          planta_id: Number(plantaId),
          log_id: logData.id, // UUID vinculado
          contenido: objetoContenido,
        },
      ]);

      if (errorAportes) throw errorAportes;

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
