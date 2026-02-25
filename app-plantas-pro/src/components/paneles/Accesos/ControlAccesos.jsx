import React, { useState } from "react";
import {
  FaSearch,
  FaClock,
  FaLayerGroup,
  FaShieldAlt,
  FaMobileAlt,
  FaLaptop,
  FaCopy,
  FaUserLock,
  FaUsers,
  FaMicrochip,
} from "react-icons/fa";
import { supabase } from "../../../supabaseClient";

export const ControlAccesos = () => {
  const [telefonoBusqueda, setTelefonoBusqueda] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);

  const copiarAlPortapapeles = (texto) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
  };

  const buscarUsuario = async (e) => {
    if (e) e.preventDefault();
    if (!telefonoBusqueda) return;
    setLoading(true);
    setUsuarioEncontrado(null);

    try {
      // 1. Buscamos datos del usuario
      const { data: usuario, error: errorUser } = await supabase
        .from("usuarios")
        .select("*")
        .eq("telefono", telefonoBusqueda.trim())
        .single();

      if (errorUser) throw errorUser;

      if (usuario) {
        // 2. Buscamos nombre del grupo por separado (más seguro)
        if (usuario.grupo_id) {
          const { data: grupo } = await supabase
            .from("groups") // Ajusta si tu tabla se llama 'grupos'
            .select("nombre_grupo")
            .eq("id", usuario.grupo_id)
            .single();

          usuario.nombre_grupo_format =
            grupo?.nombre_grupo || "Grupo sin nombre";
        } else {
          usuario.nombre_grupo_format = "USO INDIVIDUAL";
        }
        setUsuarioEncontrado(usuario);
      }
    } catch (err) {
      console.error("Error en búsqueda:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Formateador de fecha DD/MM/YYYY
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "00/00/0000";
    const fecha = new Date(fechaStr);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

    return (
      <div style={styles.container}>
        {/* 1. BUSCADOR */}
        <div style={styles.searchSection}>
          <form onSubmit={buscarUsuario} style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="tel"
              placeholder="9XXXXXXXX"
              value={telefonoBusqueda}
              onChange={(e) => setTelefonoBusqueda(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.btnOk} disabled={loading}>
              {loading ? "..." : "OK"}
            </button>
          </form>
        </div>

        {/* 2. VISOR ESPEJO */}
        {usuarioEncontrado ? (
          <div className="grid-transition" style={styles.mirrorCard}>
            <div style={styles.cardHeader}>
              <div style={styles.avatar}>
                {usuarioEncontrado.alias?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userMainInfo}>
                <h3 style={styles.userName}>
                  {usuarioEncontrado.primerNombre}{" "}
                  {usuarioEncontrado.primerApellido}
                </h3>
                <span style={styles.userAlias}>@{usuarioEncontrado.alias}</span>
              </div>
              <div style={getBadgeStyle(usuarioEncontrado.status)}>
                {usuarioEncontrado.status}
              </div>
            </div>

            <div style={styles.infoList}>
              {/* ROL */}
              <div style={styles.infoRow}>
                <div style={styles.iconCircle}>
                  <FaShieldAlt size={14} />
                </div>
                <div style={styles.textStack}>
                  <label style={styles.label}>NIVEL DE ROL</label>
                  <span style={styles.value}>{usuarioEncontrado.rol}</span>
                </div>
              </div>

              {/* GRUPO */}
              <div
                style={styles.infoRow}
                onClick={() => copiarAlPortapapeles(usuarioEncontrado.grupo_id)}
              >
                <div style={styles.iconCircle}>
                  <FaLayerGroup size={14} />
                </div>
                <div style={styles.textStack}>
                  <label style={styles.label}>
                    GRUPO: {usuarioEncontrado.nombre_grupo_format}
                  </label>
                  <span style={styles.value}>
                    ID: {usuarioEncontrado.grupo_id || "Individual"}
                  </span>
                </div>
                <FaCopy style={styles.copyIcon} />
              </div>

              {/* PERMISOS (MODO ACCESO) */}
              <div style={styles.infoRow}>
                <div style={styles.iconCircle}>
                  <FaUserLock size={14} />
                </div>
                <div style={styles.textStack}>
                  <label style={styles.label}>MODO DE ACCESO PERMITIDO</label>
                  <div style={styles.deviceIconsRow}>
                    <FaMobileAlt
                      style={getIconStyle(
                        usuarioEncontrado.modo_acceso?.toLowerCase().trim() ===
                          "solo_movil",
                      )}
                    />
                    <FaLaptop
                      style={getIconStyle(
                        usuarioEncontrado.modo_acceso?.toLowerCase().trim() ===
                          "solo_laptop",
                      )}
                    />
                    <span
                      style={{
                        ...styles.badgeDevice,
                        ...getIconStyle(
                          usuarioEncontrado.modo_acceso
                            ?.toLowerCase()
                            .trim() === "sesion_unica",
                        ),
                      }}
                    >
                      1S
                    </span>
                    <span
                      style={{
                        ...styles.badgeDevice,
                        ...getIconStyle(
                          usuarioEncontrado.modo_acceso
                            ?.toLowerCase()
                            .trim() === "doble_dispositivo",
                        ),
                      }}
                    >
                      2D
                    </span>
                    <FaUsers
                      style={getIconStyle(
                        usuarioEncontrado.modo_acceso?.toLowerCase().trim() ===
                          "libre",
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* HARDWARE (REALIDAD) */}
              <div style={styles.infoRow}>
                <div style={styles.iconCircle}>
                  <FaMicrochip size={14} />
                </div>
                <div style={styles.textStack}>
                  <label style={styles.label}>HARDWARE VINCULADO (REAL)</label>
                  <div style={styles.deviceIconsRow}>
                    <div style={styles.hwStatusItem}>
                      <FaMobileAlt
                        style={{
                          color: usuarioEncontrado.id_movil
                            ? "#2D5A27"
                            : "#DDD",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "8px",
                          color: usuarioEncontrado.id_movil
                            ? "#2D5A27"
                            : "#AAA",
                        }}
                      >
                        Móvil
                      </span>
                    </div>
                    <div style={styles.hwStatusItem}>
                      <FaLaptop
                        style={{
                          color: usuarioEncontrado.id_laptop
                            ? "#2D5A27"
                            : "#DDD",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "8px",
                          color: usuarioEncontrado.id_laptop
                            ? "#2D5A27"
                            : "#AAA",
                        }}
                      >
                        PC
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* VENCIMIENTO FORMATEADO */}
              <div style={styles.infoRow}>
                <div style={styles.iconCircle}>
                  <FaClock size={14} />
                </div>
                <div style={styles.textStack}>
                  <label style={styles.label}>FECHA DE VENCIMIENTO</label>
                  <span style={styles.value}>
                    {formatearFecha(usuarioEncontrado.suscripcion_vence)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div style={styles.emptyState}>
              Busque un teléfono para validar datos
            </div>
          )
        )}
      </div>
    );
};

// --- ESTILOS COMPLETO ---
const styles = {
  container: { padding: "5px" },
  searchSection: { marginBottom: "1.2rem" },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#FFF",
    borderRadius: "12px",
    padding: "0.4rem 0.8rem",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
  },
  searchIcon: { color: "#2D5A27", marginRight: "0.8rem" },
  searchInput: {
    border: "none",
    outline: "none",
    flex: 1,
    fontSize: "16px",
    color: "#333",
  },
  btnOk: {
    backgroundColor: "#2D5A27",
    color: "white",
    border: "none",
    padding: "6px 16px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  mirrorCard: {
    background: "white",
    borderRadius: "15px",
    padding: "1.2rem",
    borderLeft: "4px solid #2D5A27",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.2rem",
  },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#F0F4F1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#2D5A27",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  userMainInfo: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
  },
  userName: {
    margin: 0,
    fontSize: "1rem",
    color: "#1A2E26",
    fontWeight: "700",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userAlias: { fontSize: "0.75rem", color: "#666" },
  infoList: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    background: "#F8F9F8",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  iconCircle: { color: "#2D5A27", opacity: 0.7 },
  textStack: { display: "flex", flexDirection: "column", flex: 1 },
  label: {
    fontSize: "0.6rem",
    color: "#999",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  value: { fontSize: "0.85rem", color: "#333", fontWeight: "600" },
  copyIcon: { color: "#CCC", fontSize: "0.8rem" },
  deviceIconsRow: {
    display: "flex",
    gap: "20px",
    marginTop: "5px",
    alignItems: "center",
  },
  hwStatusItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  badgeDevice: {
    fontSize: "9px",
    fontWeight: "bold",
    border: "1px solid",
    padding: "1px 3px",
    borderRadius: "4px",
  },
  emptyState: {
    textAlign: "center",
    padding: "2rem",
    color: "#AAA",
    fontSize: "0.85rem",
  },
};

const getBadgeStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: "6px",
  fontSize: "10px",
  fontWeight: "bold",
  backgroundColor: status === "ACTIVO" ? "#E8F5E9" : "#FFEBEE",
  color: status === "ACTIVO" ? "#2D5A27" : "#C62828",
  border: `1px solid ${status === "ACTIVO" ? "#2D5A27" : "#C62828"}`,
  flexShrink: 0,
});

const getIconStyle = (isActive) => ({
  color: isActive ? "#2D5A27" : "#D1D1D1",
  borderColor: isActive ? "#2D5A27" : "#DDD",
  opacity: isActive ? 1 : 0.25,
  transform: isActive ? "scale(1.2)" : "scale(1)", // El activo se ve un 20% más grande
  fontWeight: isActive ? "900" : "normal",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
});