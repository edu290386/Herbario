import { useState, useRef } from "react";
import {
  IoMdCheckmarkCircle,
  IoMdCloseCircle,
} from "react-icons/io";
import {
  TbCamera,
  TbTrash,
} from "react-icons/tb";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { BotonCancelar } from "../../components/ui/BotonCancelar";
import { StatusBanner } from "../../components/ui/StatusBanner";
import "./FormImagen.css";

export const FormImagen = ({
  plantaId,
  nombrePlanta,
  conteoActual,
  onCancel,
}) => {
  const [etiquetaFoto, setEtiquetaFoto] = useState("hoja");
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const fileInputRef = useRef(null);
  const cupoLleno = conteoActual && conteoActual[etiquetaFoto] >= 3;
  const tieneFotoReal = !!archivo;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const manejarEnvio = async (e) => {
    if (e) e.preventDefault();
    setEnviando(true);
    // Lógica de envío...
    setTimeout(() => {
      setEnviando(false);
      setExito(true);
      setTimeout(() => onCancel(), 1500);
    }, 2000);
  };

  const categoriasBotánicas = [
    { id: "perfil", label: "Perfil"},
    { id: "hoja", label: "Hoja" },
    { id: "flor", label: "Flor" },
    { id: "tallo", label: "Tallo" },
    { id: "fruto", label: "Fruto" },
    { id: "semilla", label: "Semilla" },
    { id: "raiz", label: "Raíz" },
  ];

  return (
    <div className="registro-page-container">
      <form onSubmit={manejarEnvio} className="registro-card">
        {/* SECCIÓN 1: DISPLAY DE PLANTA */}
        <div className="registro-section">
          <div className="oz-display-name">{nombrePlanta?.toUpperCase()}</div>
        </div>

        {/* SECCIÓN 2: SELECTOR INNOVADOR (TABS) */}
        <div className="registro-section">
          <label className="registro-label">PARTE DE LA PLANTA</label>
          <div className="oz-category-tabs">
            {categoriasBotánicas.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`oz-tab-item ${etiquetaFoto === cat.id ? "active" : ""}`}
                onClick={() => setEtiquetaFoto(cat.id)}
              >
                <span className="oz-tab-icon">{cat.icon}</span>
                <span className="oz-tab-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECCIÓN 3: VISOR BOTÁNICO 3:4 */}
        <div className="registro-section">
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
                <p>CARGAR FOTO</p>
                <span>Cámara o Galería</span>
              </div>
            ) : (
              <div className="oz-preview-wrapper">
                <img src={preview} alt="Aporte" className="oz-img-botanica" />
                <div className="oz-visor-overlay">
                  <div className="oz-visor-badge">
                    {etiquetaFoto.toUpperCase()}
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

        {/* SECCIÓN 4: VALIDACIONES */}
        <div className="registro-section">
          <div className="registro-validaciones">
            <div className="val-item">
              {tieneFotoReal ? (
                <IoMdCheckmarkCircle color="#2d6a4f" />
              ) : (
                <IoMdCloseCircle color="#f44336" />
              )}
              <span>Imagen cargada</span>
            </div>
            <div className="val-item">
              <IoMdCheckmarkCircle color={cupoLleno ? "#f59e0b" : "#2d6a4f"} />
              <span>
                {cupoLleno ? "Categoría llena (3/3)" : "Espacio disponible"}
              </span>
            </div>
          </div>

          {cupoLleno && !enviando && (
            <div className="status-banner-wrapper">
              <StatusBanner
                status="warning"
                message="Esta categoría ya tiene 3 fotos oficiales."
              />
            </div>
          )}
        </div>

        {/* FOOTER: BOTONES ORIGINALES */}
        <div className="registro-botones-footer">
          <BotonPrincipal
            type="submit"
            texto={enviando ? "SUBIENDO..." : "FINALIZAR REPORTE"}
            estaCargando={enviando}
            esExitoso={exito}
            disabled={!tieneFotoReal || enviando}
          />
          <div className="boton-cancelar-wrapper">
            <BotonCancelar texto="CANCELAR" variante="azul-slate-claro" />
          </div>
        </div>
      </form>
    </div>
  );
};
