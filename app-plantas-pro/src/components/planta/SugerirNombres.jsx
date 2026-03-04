import { useState } from "react";
import { TbPlus, TbCheck } from "react-icons/tb";
import { PAISES_CONFIG } from "../../constants/paisesConfig";
import { colores } from "../../constants/tema";

export const SugerirNombre = ({ onSugerir }) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [nuevaSugerencia, setNuevaSugerencia] = useState({
    pais: "PE",
    texto: "",
  });

  const manejarEnvio = () => {
    if (!nuevaSugerencia.texto.trim()) return;
    onSugerir({
      pais: nuevaSugerencia.pais,
      nombre: nuevaSugerencia.texto,
    });
    setEnviado(true);
    setTimeout(() => {
      setMostrarForm(false);
      setEnviado(false);
    }, 3000);
  };

  if (!mostrarForm)
    return (
      <button onClick={() => setMostrarForm(true)} style={styles.btnAbrir}>
        <TbPlus size={10} /> SUGERIR NOMBRE LOCAL
      </button>
    );

  return (
    <div style={styles.miniForm}>
      {enviado ? (
        <span style={styles.gracias}>
          <TbCheck /> ¡Recibido!
        </span>
      ) : (
        <>
          <select
            value={nuevaSugerencia.pais}
            style={styles.select}
            onChange={(e) =>
              setNuevaSugerencia({ ...nuevaSugerencia, pais: e.target.value })
            }
          >
            {PAISES_CONFIG.map((p) => (
              <option key={p.id} value={p.id}>
                {p.bandera} {p.id}
              </option>
            ))}
          </select>
          <input
            placeholder="Nombre..."
            style={styles.input}
            onChange={(e) =>
              setNuevaSugerencia({ ...nuevaSugerencia, texto: e.target.value })
            }
          />
          <button onClick={manejarEnvio} style={styles.btnEnviar}>
            OK
          </button>
          <button
            onClick={() => setMostrarForm(false)}
            style={styles.btnCancelar}
          >
            X
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  btnAbrir: {
    background: "none",
    border: "1px dashed #ccc",
    color: "#888",
    fontSize: "9px",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "700",
  },
  miniForm: {
    display: "flex",
    gap: "5px",
    marginTop: "10px",
    alignItems: "center",
  },
  select: {
    fontSize: "11px",
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  input: {
    fontSize: "12px",
    padding: "3px 6px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    flex: 1,
  },
  btnEnviar: {
    backgroundColor: colores.frondoso,
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "10px",
    padding: "4px 8px",
    fontWeight: "bold",
  },
  btnCancelar: {
    background: "none",
    border: "none",
    color: "#ff4d4d",
    cursor: "pointer",
    fontWeight: "bold",
  },
  gracias: {
    fontSize: "11px",
    color: colores.frondoso,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
};
