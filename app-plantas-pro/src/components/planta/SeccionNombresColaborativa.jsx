import { useState } from "react";
import { TbThumbUp, TbWorld } from "react-icons/tb";
import { GiAfrica } from "react-icons/gi";
import { TiDelete } from "react-icons/ti";
import { IoMdAddCircle } from "react-icons/io";
import { FaCheckCircle, FaThumbsUp } from "react-icons/fa"; // <--- Tu nuevo ícono de Check
import { PAISES_CONFIG } from "../../constants/paisesConfig";
import { colores } from "../../constants/tema";
import { BiLike } from "react-icons/bi";

const renderBandera = (codigoPais) => {
  if (codigoPais === "world") return <TbWorld size={18} color="#555" />;
  if (codigoPais === "yoruba") return <GiAfrica size={18} color="#8d6e63" />;

  return (
    <img
      src={`https://flagcdn.com/${codigoPais.toLowerCase()}.svg`}
      width="18"
      alt={codigoPais}
      style={{ borderRadius: "2px", objectFit: "cover" }}
    />
  );
};

export const SeccionNombresColaborativa = ({
  datosNombres = [],
  usuarioActual,
  onVotar,
  onSugerir,
}) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [temp, setTemp] = useState({ pais: "PE", texto: "" });
  const esStaff =
    usuarioActual?.rol === "Administrador" ||
    usuarioActual?.rol === "Colaborador";

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.tituloGroup}>
          <TbWorld size={16} color={colores.frondoso} />
          <h4 style={styles.titulo}>Identidad Regional</h4>
        </div>

        {/* ÍCONO AGREGAR: IoMdAddCircle */}
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)} style={styles.btnPlus}>
            <IoMdAddCircle size={26} color={colores.frondoso} />
          </button>
        )}
      </div>

      {mostrarForm && (
        <div style={styles.formAnimado}>
          <select
            style={styles.select}
            value={temp.pais}
            onChange={(e) => setTemp({ ...temp, pais: e.target.value })}
          >
            {PAISES_CONFIG.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            ))}
          </select>
          <input
            style={styles.input}
            placeholder="Nuevo nombre..."
            onChange={(e) => setTemp({ ...temp, texto: e.target.value })}
          />

          {/* ÍCONO CONFIRMAR SUBIDA: FaCheckCircle */}
          <button
            style={styles.btnDone}
            onClick={() => {
              onSugerir(temp);
              setMostrarForm(false);
            }}
          >
            <FaCheckCircle size={18} color={colores.frondoso} />
          </button>

          {/* ÍCONO CANCELAR: TiDelete */}
          <button
            style={styles.btnCancel}
            onClick={() => setMostrarForm(false)}
          >
            <TiDelete size={26} color="#ff4d4d" />
          </button>
        </div>
      )}

      <div style={styles.lista}>
        {datosNombres?.map((bloque, i) => (
          <div key={i} style={styles.fila}>
            <div style={styles.paisBadge}>
              <span style={styles.flag}>{renderBandera(bloque.pais)}</span>
              <span style={styles.sigla}>{bloque.pais}</span>
            </div>

            <div style={styles.nombresContainer}>
              {bloque.nombres.map((n, idx) => {
                if (!n.verificado && !esStaff && n.votos < 1) return null;

                return (
                  <div
                    key={idx}
                    style={{
                      ...styles.pildora,
                      backgroundColor: n.verificado ? "#f0f7f0" : "#ffffff",
                      borderColor: n.verificado ? colores.frondoso : "#eee",
                    }}
                  >
                    <span style={styles.nombreTexto}>{n.texto}</span>

                    {!n.verificado && (
                      <button
                        style={styles.votoBtn}
                        onClick={() => onVotar(bloque.pais, n.texto)}
                        title={esStaff ? "Aprobar nombre" : "Votar este nombre"}
                      >
                        <FaThumbsUp size={13} />
                        <span>
                          {n.votos || 0} {n.votos === 1 ? "voto" : "votos"}
                        </span>
                      </button>
                    )}

                    {/* ÍCONO NOMBRE VERIFICADO: FaCheckCircle */}
                    {n.verificado && (
                      <FaCheckCircle
                        size={12}
                        color={colores.frondoso}
                        style={{ marginLeft: "2px" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Estilos ultra-compactos intactos
const styles = {
  card: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "12px 15px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
    margin: "10px 0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  tituloGroup: { display: "flex", alignItems: "center", gap: "6px" },
  titulo: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: 0,
  },
  btnPlus: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  formAnimado: {
    display: "flex",
    gap: "6px",
    padding: "4px 8px",
    backgroundColor: "#ffffff", // Fondo 100% blanco para toda la zona
    border: "1px solid #e0e0e0", // Un solo borde para todo el bloque
    borderRadius: "8px",
    marginBottom: "12px",
    alignItems: "center",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
  },
  select: {
    border: "none",
    borderRight: "1px solid #eee", // Línea divisoria elegante
    borderRadius: "0",
    fontSize: "11px",
    padding: "4px 8px 4px 0",
    backgroundColor: "transparent", // Hereda el blanco del padre
    outline: "none",
    cursor: "pointer",
    color: "#555",
  },
  input: {
    flex: 1,
    border: "none",
    backgroundColor: "transparent", // Hereda el blanco del padre
    padding: "5px 8px",
    fontSize: "12px",
    outline: "none",
    color: "#333",
  },
  btnDone: {
    background: "transparent",
    border: "none",
    padding: "0 4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  }, // Le quité el fondo verde para que luzca el FaCheckCircle
  btnCancel: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 0,
    margin: 0,
  },
  lista: { display: "flex", flexDirection: "column", gap: "10px" },
  fila: { display: "flex", alignItems: "flex-start", gap: "8px" },
  paisBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "30px",
  },
  flag: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "18px",
  },
  sigla: {
    fontSize: "9px",
    fontWeight: "900",
    color: "#bbb",
    marginTop: "1px",
  },
  nombresContainer: { display: "flex", flexWrap: "wrap", gap: "4px" },
  pildora: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px",
    borderRadius: "8px",
    border: "1px solid",
    transition: "all 0.2s",
  },
  nombreTexto: { fontSize: "12px", fontWeight: "600", color: "#333" },
  votoBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    border: "none",
    background: "transparent", // Adiós parche gris
    padding: "0 4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    color: "#1877F2", // Azul Facebook clásico
    transition: "transform 0.1s ease", // Pequeño efecto al hacer clic en lugar de cambio de fondo
  },
};
