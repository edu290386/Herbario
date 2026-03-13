import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { logService } from "../../services/logService";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import { PAISES_CONFIG } from "../../constants/paisesConfig";
import { GuiaRegistro } from "../Registro/GuiaRegistro";
import "./FormNombre.css";

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
      const objetoContenido = {
        nombre_sugerido: nuevoNombre.trim(),
        procedencia: paisSeleccionado,
      };

      // 🟢 USAMOS EL SERVICIO CENTRALIZADO
      await logService.enviarAporte({
        plantaId: Number(plantaId),
        nombrePlanta,
        usuarioId: user?.id,
        alias: user?.alias || "Usuario Ozain",
        grupoId: user?.grupo_id || "Sin grupo",
        grupo: user?.grupo || "Sin grupo",
        tipoAccion: "nuevo_nombre",
        contenidoJSON: objetoContenido,
      });

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
        <div className="registro-section">
          <div className="oz-display-name">{nombrePlanta?.toUpperCase()}</div>
        </div>

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

        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto={enviando ? "PROCESANDO..." : "ENVIAR SUGERENCIA"}
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
