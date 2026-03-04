import { useState } from "react";
import { BiLike, BiDislike } from "react-icons/bi";
import { TbWorld, TbChevronUp, TbChevronDown } from "react-icons/tb";
import { GiAfrica } from "react-icons/gi";
import { IoMdAddCircle } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { PAISES_CONFIG } from "../../constants/paisesConfig";

const renderBandera = (codigoPais) => {
  if (codigoPais === "world") return <TbWorld size={15} color="#555" />;
  if (codigoPais === "yoruba") return <GiAfrica size={15} color="#8d6e63" />;
  return (
    <img
      src={`https://flagcdn.com/${codigoPais.toLowerCase()}.svg`}
      width="17"
      alt={codigoPais}
      style={{ borderRadius: "2px", objectFit: "cover" }}
    />
  );
};

export const SeccionNombresColaborativa = ({ datosNombres = [], usuarioActual, onVotar, onSugerir }) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [temp, setTemp] = useState({ pais: "PE", texto: "" });
  
  // Estados para controlar la apertura de las carpetas
  const [abiertoOficial, setAbiertoOficial] = useState(true);
  const [abiertoPropuestas, setAbiertoPropuestas] = useState(false);

  const esStaff = usuarioActual?.rol === "Administrador" || usuarioActual?.rol === "Colaborador";

  const bloquesOficiales = datosNombres.map((bloque) => ({
    ...bloque,
    nombres: bloque.nombres.filter((n) => n.verificado),
  })).filter((b) => b.nombres.length > 0);

  const bloquesCandidatos = datosNombres.map((bloque) => ({
    ...bloque,
    nombres: bloque.nombres.filter((n) => !n.verificado && !n.rechazado),
  })).filter((b) => b.nombres.length > 0);

  return (
    <div style={styles.container}>
      
      {/* --- CARPETA: NOMBRES OFICIALES --- */}
      <div style={{
        ...styles.folder,
        backgroundColor: abiertoOficial ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.3)",
      }}>
        <button style={styles.folderHeader} onClick={() => setAbiertoOficial(!abiertoOficial)}>
          <div style={styles.titleGroup}>
            <div style={{...styles.dot, backgroundColor: abiertoOficial ? "#2d8b57" : "#ccc"}} />
            <span style={{...styles.folderTitle, color: abiertoOficial ? "#1a1a1a" : "#666"}}>
              Nombres Oficiales
            </span>
          </div>
          {abiertoOficial ? <TbChevronUp size={18} color="#2d8b57"/> : <TbChevronDown size={18} color="#999"/>}
        </button>

        {abiertoOficial && (
          <div style={styles.folderContent}>
            <div style={styles.listaBloques}>
              {bloquesOficiales.map((bloque, i) => (
                <div key={i} style={styles.cardPais}>
                  <div style={styles.paisHeader}>
                    {renderBandera(bloque.pais)}
                    <span style={styles.siglaPais}>{bloque.pais.toUpperCase()}</span>
                  </div>
                  <div style={styles.nombresWrapHorizontal}>
                    {bloque.nombres.map((n, idx) => (
                      <div key={idx} style={styles.itemNombre}>
                        <span style={styles.textoNombreGlobal}>{n.texto}</span>
                        <FaCheckCircle size={10} color="#2d8b57" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- CARPETA: PROPUESTAS --- */}
      <div style={{
        ...styles.folder,
        backgroundColor: abiertoPropuestas ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.3)",
      }}>
        <div style={styles.headerConAccion}>
          <button style={styles.folderHeaderInvisible} onClick={() => setAbiertoPropuestas(!abiertoPropuestas)}>
            <div style={styles.titleGroup}>
              <div style={{...styles.dot, backgroundColor: abiertoPropuestas ? "#1877F2" : "#ccc"}} />
              <span style={{...styles.folderTitle, color: abiertoPropuestas ? "#1a1a1a" : "#666"}}>
                Propuestas
              </span>
            </div>
            {abiertoPropuestas ? <TbChevronUp size={18} color="#1877F2"/> : <TbChevronDown size={18} color="#999"/>}
          </button>
          
          <button onClick={() => setMostrarForm(!mostrarForm)} style={styles.addBtn}>
            <IoMdAddCircle size={22} color="#2d8b57" />
          </button>
        </div>

        {mostrarForm && (
          <div style={styles.glassForm}>
            <select style={styles.glassSelect} value={temp.pais} onChange={(e) => setTemp({ ...temp, pais: e.target.value })}>
              {PAISES_CONFIG.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <input style={styles.glassInput} placeholder="Sugerir..." value={temp.texto} onChange={(e) => setTemp({ ...temp, texto: e.target.value })} />
            <button style={styles.glassSubmit} onClick={() => { onSugerir(temp); setMostrarForm(false); setTemp({ pais: "PE", texto: "" }); }}>
              OK
            </button>
          </div>
        )}

        {abiertoPropuestas && (
          <div style={styles.folderContent}>
            <div style={styles.listaBloques}>
              {bloquesCandidatos.map((bloque, i) => (
                <div key={i} style={styles.cardPais}>
                  <div style={styles.paisHeader}>
                    {renderBandera(bloque.pais)}
                    <span style={styles.siglaPais}>{bloque.pais.toUpperCase()}</span>
                  </div>
                  <div style={styles.nombresWrapHorizontal}>
                    {bloque.nombres.map((n, idx) => {
                      const yaVotoLike = n.votos_usuarios?.includes(usuarioActual?.id);
                      const yaVotoDislike = n.dislikes_usuarios?.includes(usuarioActual?.id);
                      return (
                        <div key={idx} style={styles.itemNombre}>
                          <span style={styles.textoNombreGlobal}>{n.texto}</span>
                          <div style={styles.votosGrupo}>
                            <button style={{ ...styles.votoBtn, opacity: yaVotoLike || esStaff ? 1 : 0.4 }} onClick={() => onVotar(bloque.pais, n.texto, "like")} disabled={yaVotoLike && !esStaff}>
                              <BiLike color="#1877F2" size={13} />
                              <span style={styles.votoNum}>{n.votos_usuarios?.length || 0}</span>
                            </button>
                            <button style={{ ...styles.votoBtn, opacity: yaVotoDislike || esStaff ? 1 : 0.4 }} onClick={() => onVotar(bloque.pais, n.texto, "dislike")} disabled={yaVotoDislike && !esStaff}>
                              <BiDislike color="#d32f2f" size={13} />
                            </button>
                          </div>
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
    </div>
  );
};

const styles = {
  container: { margin: "0", display: "flex", flexDirection: "column", gap: "4px" },
  
  // Estructura Externa: Carpetas de Cristal
  folder: {
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(12px)",
    transition: "all 0.3s ease",
    overflow: "hidden"
  },
  folderHeader: {
    width: "100%", padding: "10px 14px", display: "flex", justifyContent: "space-between", 
    alignItems: "center", background: "none", border: "none", cursor: "pointer"
  },
  headerConAccion: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: "10px" },
  folderHeaderInvisible: { flex: 1, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer" },
  
  titleGroup: { display: "flex", alignItems: "center", gap: "8px" },
  dot: { width: "6px", height: "6px", borderRadius: "50%" },
  folderTitle: { fontSize: "11px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px" },
  folderContent: { padding: "0 10px 10px 10px" },

  // Estética Interna: (Se mantiene intacta según tu petición)
  addBtn: { background: "none", border: "none", cursor: "pointer", padding: "0" },
  glassForm: { display: "flex", background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: "8px", margin: "0 10px 10px 10px", gap: "6px", border: "1px solid #ddd" },
  glassSelect: { border: "none", background: "none", fontSize: "11px", fontWeight: "700", color: "#2d8b57" },
  glassInput: { flex: 1, border: "none", background: "none", outline: "none", fontSize: "12px" },
  glassSubmit: { background: "#2d8b57", color: "white", border: "none", padding: "3px 8px", borderRadius: "4px", fontWeight: "900", fontSize: "9px" },
  listaBloques: { display: "flex", flexDirection: "column", gap: "6px" },
  cardPais: { background: "rgba(255, 255, 255, 0.4)", borderRadius: "12px", padding: "8px 10px", border: "1px solid rgba(255, 255, 255, 0.5)" },
  paisHeader: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "2px" },
  siglaPais: { fontSize: "8px", fontWeight: "900", color: "#ccc" },
  nombresWrapHorizontal: { display: "flex", flexWrap: "wrap", gap: "6px 15px", alignItems: "center" },
  itemNombre: { display: "flex", alignItems: "center", gap: "4px" },
  textoNombreGlobal: { fontSize: "17px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "-0.5px", margin: "0" },
  votosGrupo: { display: "flex", alignItems: "center", gap: "6px" },
  votoBtn: { background: "none", border: "none", display: "flex", alignItems: "center", gap: "2px", cursor: "pointer", padding: "0" },
  votoNum: { fontSize: "11px", fontWeight: "800", color: "#1877F2" },
};