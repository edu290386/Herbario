import React, { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";

export const FormComentario = ({ plantaId, nombrePlanta, onCancel }) => {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!texto.trim()) return alert("Escribe tu comentario.");

    setEnviando(true);

    const payload = {
      planta_id: plantaId,
      tipo: "comentario",
      contenido: texto,
    };

    console.log("Comentario para la planta:", nombrePlanta, payload);

    setTimeout(() => {
      alert("¡Gracias por tu comentario!");
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
          <h3>Añadir Información</h3>
          <p className="subtitle-aporte">{nombrePlanta}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="form-label-tiny">TU COMENTARIO O DATO CURIOSO</label>
        <textarea
          className="form-input textarea-aporte"
          placeholder="Comparte consejos de cultivo, usos o curiosidades..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={6}
        />

        <div className="form-footer-btns">
          <button type="button" onClick={onCancel} className="btn-secundario">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn-primario">
            {enviando ? "Enviando..." : "Enviar Comentario"}
          </button>
        </div>
      </form>
    </div>
  );
};
