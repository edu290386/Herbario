import React, { useState } from "react";
import { PAISES_CONFIG } from "../../constants/paisesConfig";
import { FaChevronLeft, FaGlobeAmericas } from "react-icons/fa";
import "./FormNombre.css"

export const FormNombre = ({ plantaId, nombrePlanta, onCancel }) => {
  const [datos, setDatos] = useState({ pais: "PE", texto: "" });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!datos.texto.trim()) return alert("Escribe un nombre.");

    setEnviando(true);

    const payload = {
      planta_id: plantaId,
      tipo: "nombre",
      pais: datos.pais,
      nombre_sugerido: datos.texto,
    };

    console.log("Sugerencia enviada:", payload);

    setTimeout(() => {
      alert(`Sugerencia para ${nombrePlanta} enviada con éxito.`);
      onCancel();
    }, 1200);
  };

  return (
    <div className="form-aporte-main">
      <div className="form-header-simple">
        <button onClick={onCancel} className="btn-back-mini" type="button">
          <FaChevronLeft />
        </button>
        <div className="header-text-block">
          <h3>Sugerir Nombre</h3>
          <p className="subtitle-aporte">{nombrePlanta}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="form-label-tiny">PAÍS / REGIÓN</label>
        <select
          className="form-select-modern"
          value={datos.pais}
          onChange={(e) => setDatos({ ...datos, pais: e.target.value })}
        >
          {PAISES_CONFIG.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <label className="form-label-tiny">NOMBRE COMÚN</label>
        <div className="input-with-icon">
          <FaGlobeAmericas className="input-inner-icon" />
          <input
            className="input-text-modern"
            placeholder="Ej: Menta Blanca..."
            value={datos.texto}
            onChange={(e) => setDatos({ ...datos, texto: e.target.value })}
          />
        </div>

        <div className="form-footer-btns">
          <button type="button" onClick={onCancel} className="btn-secundario">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn-primario">
            {enviando ? "Enviando..." : "Sugerir Nombre"}
          </button>
        </div>
      </form>
    </div>
  );
};