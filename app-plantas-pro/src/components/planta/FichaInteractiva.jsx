import { useState } from "react";
import { BiLike, BiDislike } from "react-icons/bi";
import {
  TbWorld,
  TbChevronUp,
  TbChevronDown,
  TbBrandYoutubeFilled,
  TbLink,
} from "react-icons/tb";
import { AiFillTikTok, AiFillFacebook } from "react-icons/ai";
import { SiInstagram } from "react-icons/si";
import { FaCheckCircle } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { GiAfrica } from "react-icons/gi";
import { PAISES_CONFIG } from "../../constants/paisesConfig";

const ICONOS_REDES = {
  youtube: {
    icono: TbBrandYoutubeFilled,
    color: "#FF0000",
    label: "YOUTUBE",
    size: 20,
  },
  tiktok: { icono: AiFillTikTok, color: "#000000", label: "TIK TOK", size: 24 },
  facebook: {
    icono: AiFillFacebook,
    color: "#1877F2",
    label: "FACEBOOK",
    size: 24,
  },
  instagram: {
    icono: SiInstagram,
    color: "#E1306C",
    label: "INSTAGRAM",
    size: 19,
  
  },
  web: { icono: TbLink, color: "#666", label: "WEB", size: 24 },
};

const renderBandera = (codigoPais) => {
  if (codigoPais === "world") return <TbWorld size={15} color="#555" />;
  if (codigoPais === "yoruba") return <GiAfrica size={15} color="#8d6e63" />;
  return (
    <img
      src={`https://flagcdn.com/${codigoPais.toLowerCase()}.svg`}
      width="17"
      style={{ borderRadius: "2px", objectFit: "cover", display: "block" }}
      alt={codigoPais}
    />
  );
};

export const FichaInteractiva = ({
  planta,
  usuarioActual,
  onVotar,
  onSugerir,
}) => {
  const [oficialAbierto, setOficialAbierto] = useState(true);
  const [acordeonActivo, setAcordeonActivo] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [temp, setTemp] = useState({ pais: "", texto: "" });

  const esStaff =
    usuarioActual?.rol === "Administrador" ||
    usuarioActual?.rol === "Colaborador";

  const bloquesOficiales =
    planta.nombres_internacionales
      ?.map((b) => ({
        ...b,
        nombres: b.nombres.filter((n) => n.verificado).slice(0, 3),
      }))
      .filter((b) => b.nombres.length > 0) || [];

  const bloquesCandidatos =
    planta.nombres_internacionales
      ?.map((b) => ({
        ...b,
        nombres: b.nombres.filter((n) => !n.verificado && !n.rechazado),
      }))
      .filter((b) => b.nombres.length > 0) || [];

  const redesAgrupadas =
    planta.enlaces_redes?.reduce((acc, curr) => {
      const plat = curr.plataforma.toLowerCase();
      if (!acc[plat]) acc[plat] = [];
      acc[plat].push(curr);
      return acc;
    }, {}) || {};

  const toggleAcordeon = (id) =>
    setAcordeonActivo(acordeonActivo === id ? null : id);

  return (
    <div style={styles.container}>
      {/* 1. NOMBRES OFICIALES */}
      <div
        style={{
          ...styles.folder,
          backgroundColor: oficialAbierto
            ? "rgba(255,255,255,0.7)"
            : "rgba(255,255,255,0.3)",
        }}
      >
        <button
          style={styles.folderHeader}
          onClick={() => setOficialAbierto(!oficialAbierto)}
        >
          <div style={styles.titleGroup}>
            <div
              style={{
                ...styles.dot,
                backgroundColor: oficialAbierto ? "#2d8b57" : "#ccc",
              }}
            />
            <span
              style={{
                ...styles.folderTitle,
                color: oficialAbierto ? "#1a1a1a" : "#666",
              }}
            >
              Nombres Oficiales
            </span>
          </div>
          {oficialAbierto ? (
            <TbChevronUp size={18} color="#2d8b57" />
          ) : (
            <TbChevronDown size={18} color="#999" />
          )}
        </button>
        {oficialAbierto && (
          <div style={styles.content}>
            <div style={styles.listaBloques}>
              {bloquesOficiales.map((bloque, i) => (
                <div key={i} style={styles.filaPaisCompacta}>
                  <div style={styles.paisIdentificador}>
                    {renderBandera(bloque.pais)}
                    <span style={styles.siglaPais}>
                      {bloque.pais.toUpperCase()}:
                    </span>
                  </div>
                  <div style={styles.nombresInline}>
                    {bloque.nombres.map((n, idx) => (
                      <div key={idx} style={styles.itemNombreOficial}>
                        <span style={styles.textoNombreOficial}>{n.texto}</span>
                        <FaCheckCircle size={10} color="#2d8b57" />
                        {idx < bloque.nombres.length - 1 && (
                          <span style={styles.separador}>•</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. PROPUESTAS */}
      <div
        style={{
          ...styles.folder,
          backgroundColor:
            acordeonActivo === "propuestas"
              ? "rgba(255,255,255,0.7)"
              : "rgba(255,255,255,0.3)",
        }}
      >
        <button
          style={styles.folderHeader}
          onClick={() => toggleAcordeon("propuestas")}
        >
          <div style={styles.titleGroup}>
            <div
              style={{
                ...styles.dot,
                backgroundColor:
                  acordeonActivo === "propuestas" ? "#2d8b57" : "#ccc",
              }}
            />
            <span
              style={{
                ...styles.folderTitle,
                color: acordeonActivo === "propuestas" ? "#1a1a1a" : "#666",
              }}
            >
              Propuestas de la Comunidad
            </span>
          </div>
          {acordeonActivo === "propuestas" ? (
            <TbChevronUp size={18} color="#2d8b57" />
          ) : (
            <TbChevronDown size={18} color="#999" />
          )}
        </button>

        {acordeonActivo === "propuestas" && (
          <div style={styles.content}>
            {!mostrarForm && (
              <div style={styles.contenedorBtnSugerir}>
                <button
                  style={styles.btnSugerirIcono}
                  onClick={() => setMostrarForm(true)}
                >
                  SUGERIR NOMBRE <FaCheckCircle size={18} color="#2d8b57" />
                </button>
              </div>
            )}

            {mostrarForm && (
              <div style={styles.miniFormResponsive}>
                <select
                  style={styles.glassSelectModern}
                  value={temp.pais}
                  onChange={(e) => setTemp({ ...temp, pais: e.target.value })}
                >
                  <option value="" disabled>
                    LUGAR
                  </option>
                  {PAISES_CONFIG.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <input
                  style={styles.glassInputLargo}
                  placeholder="Escribe aquí..."
                  value={temp.texto}
                  onChange={(e) => setTemp({ ...temp, texto: e.target.value })}
                />
                <div style={styles.accionesForm}>
                  <FaCheckCircle
                    size={20}
                    color="#2d8b57"
                    style={{ cursor: "pointer", flexShrink: 0 }}
                    onClick={() => {
                      if (temp.pais && temp.texto) {
                        onSugerir(temp);
                        setMostrarForm(false);
                        setTemp({ pais: "", texto: "" });
                      }
                    }}
                  />
                  <TiDelete
                    size={28}
                    color="#d32f2f"
                    style={{ cursor: "pointer", flexShrink: 0 }}
                    onClick={() => {
                      setMostrarForm(false);
                      setTemp({ pais: "", texto: "" });
                    }}
                  />
                </div>
              </div>
            )}

            <div style={styles.listaBloques}>
              {bloquesCandidatos.map((bloque, i) => (
                <div key={i} style={styles.filaPaisCompacta}>
                  <div style={styles.paisIdentificador}>
                    {renderBandera(bloque.pais)}
                    <span style={styles.siglaPais}>
                      {bloque.pais.toUpperCase()}:
                    </span>
                  </div>
                  <div style={styles.nombresInline}>
                    {bloque.nombres.map((n, idx) => {
                      const yaVotoLike = n.votos_usuarios?.includes(
                        usuarioActual?.id,
                      );
                      const yaVotoDislike = n.dislikes_usuarios?.includes(
                        usuarioActual?.id,
                      );
                      return (
                        <div key={idx} style={styles.itemNombrePropuestaWrap}>
                          <span style={styles.textoNombrePropuesta}>
                            {n.texto}
                          </span>
                          <div style={styles.votosGrupoCompacto}>
                            <button
                              onClick={() =>
                                onVotar(bloque.pais, n.texto, "like")
                              }
                              style={{
                                ...styles.votoBtn,
                                opacity: yaVotoLike || esStaff ? 1 : 0.4,
                              }}
                              disabled={yaVotoLike && !esStaff}
                            >
                              <BiLike color="#1877F2" size={12} />
                              <span style={styles.votoNumTiny}>
                                {n.votos_usuarios?.length || 0}
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                onVotar(bloque.pais, n.texto, "dislike")
                              }
                              style={{
                                ...styles.votoBtn,
                                opacity: yaVotoDislike || esStaff ? 1 : 0.4,
                              }}
                              disabled={yaVotoDislike && !esStaff}
                            >
                              <BiDislike color="#d32f2f" size={12} />
                            </button>
                          </div>
                          {idx < bloque.nombres.length - 1 && (
                            <span style={styles.separador}>•</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. FICHAS TÉCNICAS */}
      {planta.secciones_info?.map((sec, i) => (
        <div
          key={`sec-${i}`}
          style={{
            ...styles.folder,
            backgroundColor:
              acordeonActivo === `sec-${i}`
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(255, 255, 255, 0.3)",
          }}
        >
          <button
            style={styles.folderHeader}
            onClick={() => toggleAcordeon(`sec-${i}`)}
          >
            <div style={styles.titleGroup}>
              <div
                style={{
                  ...styles.dot,
                  backgroundColor:
                    acordeonActivo === `sec-${i}` ? "#2d8b57" : "#ccc",
                }}
              />
              <span
                style={{
                  ...styles.folderTitle,
                  color: acordeonActivo === `sec-${i}` ? "#1a1a1a" : "#666",
                }}
              >
                {sec.titulo}
              </span>
            </div>
            {acordeonActivo === `sec-${i}` ? (
              <TbChevronUp size={18} color="#2d8b57" />
            ) : (
              <TbChevronDown size={18} color="#999" />
            )}
          </button>
          {acordeonActivo === `sec-${i}` && (
            <div style={styles.content}>
              <p style={styles.folderText}>{sec.contenido}</p>
            </div>
          )}
        </div>
      ))}

      {/* 4. ENLACES Y REDES */}
      <div
        style={{
          ...styles.folder,
          backgroundColor:
            acordeonActivo === "redes"
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(255, 255, 255, 0.3)",
        }}
      >
        <button
          style={styles.folderHeader}
          onClick={() => toggleAcordeon("redes")}
        >
          <div style={styles.titleGroup}>
            <div
              style={{
                ...styles.dot,
                backgroundColor:
                  acordeonActivo === "redes" ? "#2d8b57" : "#ccc",
              }}
            />
            <span
              style={{
                ...styles.folderTitle,
                color: acordeonActivo === "redes" ? "#1a1a1a" : "#666",
              }}
            >
              Enlaces Externos
            </span>
          </div>
          {acordeonActivo === "redes" ? (
            <TbChevronUp size={18} color="#2d8b57" />
          ) : (
            <TbChevronDown size={18} color="#999" />
          )}
        </button>
        {acordeonActivo === "redes" && (
          <div style={styles.content}>
            {Object.keys(redesAgrupadas).map((red) => {
              const config = ICONOS_REDES[red] || ICONOS_REDES.web;
              const IconoDinamico = config.icono;
              return (
                <div key={red} style={styles.filaRed}>
                  <div style={styles.redLabel}>
                    <IconoDinamico
                      size={config.size}
                      color={config.color}
                      style={red === "instagram" ? { margin: "2px" } : {}}
                    />
                    <span>{config.label}:</span>
                  </div>
                  <div style={styles.linksHorizontal}>
                    {redesAgrupadas[red].map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.linkAnchor}
                      >
                        {l.titulo || "Link"}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "10px",
  },
  folder: {
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  folderHeader: {
    width: "100%",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "10px" },
  dot: { width: "6px", height: "6px", borderRadius: "50%" },
  folderTitle: {
    fontSize: "14px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "-0.2px",
  },
  content: { padding: "0 12px 12px 12px" },
  folderText: { fontSize: "14px", color: "#444", lineHeight: "1.6", margin: 0 },

  filaPaisCompacta: {
    display: "flex",
    alignItems: "center", // Unifica alineación vertical
    gap: "8px",
    padding: "8px 0",
    borderBottom: "1px solid rgba(0,0,0,0.03)",
  },
  paisIdentificador: {
    display: "flex",
    alignItems: "center", // Asegura que bandera y sigla estén en la misma línea
    gap: "5px",
    minWidth: "60px", // Espacio reservado para bandera + sigla
  },
  siglaPais: {
    fontSize: "10px",
    fontWeight: "900",
    color: "#999",
    marginTop: "0px", // Eliminado el margen que lo desalineaba
  },
  nombresInline: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 12px",
    alignItems: "center",
    flex: 1,
  },

  itemNombreOficial: { display: "flex", alignItems: "center", gap: "4px" },
  textoNombreOficial: { fontSize: "15px", fontWeight: "700", color: "#1a1a1a" },

  itemNombrePropuestaWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  textoNombrePropuesta: { fontSize: "15px", fontWeight: "700", color: "#444" },
  separador: { color: "#ccc", fontSize: "12px", marginLeft: "4px" },

  votosGrupoCompacto: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "rgba(0,0,0,0.03)",
    padding: "2px 6px",
    borderRadius: "20px",
  },
  votoBtn: {
    background: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "2px",
    cursor: "pointer",
    padding: 0,
  },
  votoNumTiny: { fontSize: "10px", fontWeight: "800", color: "#1877F2" },

  contenedorBtnSugerir: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "12px",
  },
  btnSugerirIcono: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "none",
    border: "none",
    color: "#2d8b57",
    fontWeight: "900",
    fontSize: "12px",
    cursor: "pointer",
  },

  miniFormResponsive: {
    display: "flex",
    background: "rgba(0,0,0,0.03)",
    padding: "8px 12px",
    borderRadius: "12px",
    marginBottom: "15px",
    gap: "8px",
    border: "1px solid rgba(0,0,0,0.05)",
    alignItems: "center",
    flexWrap: "nowrap",
    overflow: "hidden",
  },

  glassSelectModern: {
    border: "none",
    background: "rgba(255,255,255,0.5)",
    fontSize: "10px",
    fontWeight: "900",
    color: "#555",
    width: "75px",
    flexShrink: 0,
    borderRadius: "6px",
    padding: "4px",
    outline: "none",
    cursor: "pointer",
  },

  glassInputLargo: {
    flex: 1,
    border: "none",
    background: "none",
    outline: "none",
    fontSize: "14px",
    height: "30px",
    fontWeight: "700",
    minWidth: "50px",
    color: "#333",
  },
  accionesForm: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
  },

  listaBloques: { display: "flex", flexDirection: "column", gap: "4px" },
  filaRed: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 0",
    borderBottom: "1px solid rgba(0,0,0,0.03)",
  },
  redLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: "100px", // Espacio para nombre de red
    fontSize: "10px",
    fontWeight: "900",
    color: "#999",
  },
  linksHorizontal: { display: "flex", flexWrap: "wrap", gap: "12px" },
  linkAnchor: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1877F2",
    textDecoration: "none",
  },
};
