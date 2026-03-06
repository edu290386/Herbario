import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import { PAISES_CONFIG } from "../../constants/paisesConfig";
import { GuiaRegistro } from "../Registro/GuiaRegistro";
import "./FormNombre.css"; // Usa los mismos estilos base de Registro

export const FormNombre = ({ plantaId, nombrePlanta, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  // Validaciones
  const nombreValido = nuevoNombre.trim().length >= 3;
  const paisValido = paisSeleccionado !== "";
  const formularioValido = nombreValido && paisValido && !enviando;

  const manejarEnvio = async (e) => {
    if (e) e.preventDefault();
    if (!formularioValido) return;

    setEnviando(true);

    try {
      // 1. PREPARAR EL CONTENIDO JSON
      const objetoContenido = {
        nombre_sugerido: nuevoNombre.trim(),
        procedencia: paisSeleccionado,
      };

      // 2. INSERTAR EN LOGS (Capturando el ID UUID)
      const { data: logData, error: errorLog } = await supabase
        .from("logs")
        .insert([
          {
            planta_id: Number(plantaId),
            usuario_id: user?.id,
            nombre_planta: nombrePlanta,
            alias: user?.alias || "Usuario Ozain",
            grupo_id: user?.grupo_id,
            tipo_accion: "nuevo_nombre", // Acción específica
            contenido: objetoContenido,
            revisado: "pendiente",
            auditado: "pendiente",
          },
        ])
        .select()
        .single();

      if (errorLog) throw errorLog;

      // 3. INSERTAR EN APORTES (Vinculación por UUID)
      const { error: errorAportes } = await supabase.from("aportes").insert([
        {
          planta_id: Number(plantaId),
          log_id: logData.id, // El UUID de la tabla logs
          contenido: objetoContenido,
        },
      ]);

      if (errorAportes) throw errorAportes;

      // 4. ÉXITO
      setExito(true);
      setTimeout(() => onCancel(), 1800);
    } catch (error) {
      console.error("Error al sugerir nombre:", error);
      alert("Error: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="registro-page-container">
      <GuiaRegistro flujo="nuevo nombre" />
      <form onSubmit={manejarEnvio} className="registro-card">
        {/* Nombre de la planta actual */}
        <div className="registro-section">
          <div className="oz-display-name">{nombrePlanta?.toUpperCase()}</div>
        </div>

        {/* Campo: Nuevo Nombre */}
        <div className="registro-section">
          <label className="registro-label">SUGERIR OTRO NOMBRE</label>
          <input
            type="text"
            className="registro-input-text"
            placeholder="Ej: Hierba buena"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            disabled={enviando || exito}
          />
        </div>

        {/* Campo: Procedencia */}
        <div className="registro-section">
          <label className="registro-label">¿DÓNDE SE USA ESTE NOMBRE?</label>
          <select
            className="registro-input-text"
            value={paisSeleccionado}
            onChange={(e) => setPaisSeleccionado(e.target.value)}
            disabled={enviando || exito}
          >
            <option value="" disabled>
              Selecciona un país
            </option>
            {PAISES_CONFIG.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Validaciones Visuales */}
        <div className="registro-section">
          <div className="registro-validaciones">
            <div className="val-item">
              {nombreValido ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>Nombre sugerido (mín. 3 letras)</span>
            </div>
            <div className="val-item">
              {paisValido ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>País de origen seleccionado</span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto={enviando ? "PROCESANDO..." : "ENVIAR SUGERENCIA"}
            estaCargando={enviando}
            esExitoso={exito}
            disabled={!formularioValido}
          />
          <div className="boton-cancelar-wrapper">
            <BotonCancelar texto="CANCELAR" variante="azul-slate-claro" />
          </div>
        </div>
      </form>
    </div>
  );
};
