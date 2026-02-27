import {
  FaLayerGroup,
  FaShieldAlt,
  FaMobileAlt,
  FaLaptop,
  FaCopy,
  FaUserLock,
  FaPhoneAlt,
  FaUsers,
  FaMicrochip,
} from "react-icons/fa";
import { BsCalendar2Check } from "react-icons/bs";

export const UserCard = ({
  usuario,
  getBadgeStyle,
  formatearFecha,
  copiarAlPortapapeles,
}) => {
  const calcularDias = (fechaVence) => {
    if (!fechaVence) return 0;
    return Math.ceil(
      (new Date(fechaVence) - new Date()) / (1000 * 60 * 60 * 24),
    );
  };

  const diasRestantes = calcularDias(usuario.suscripcion_vence);
  const textoStatus =
    !usuario.suscripcion_vence || diasRestantes <= 0
      ? "SUSPENDIDO"
      : usuario.status;
  const modo = usuario.modo_acceso?.toLowerCase();

  // Estilo base para iconos/texto de modo
  const getModeStyle = (active) => ({
    color: active ? "#2D5A27" : "#DDD",
    fontSize: active ? "18px" : "16px",
    fontWeight: "900",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <div style={styles.mirrorCard}>
      <div style={styles.cardHeader}>
        <div style={styles.avatar}>
          {usuario.nombre?.charAt(0).toUpperCase() || "O"}
        </div>
        <div style={styles.userMainInfo}>
          <h3 style={styles.userName}>
            {usuario.nombre || "NUEVO"} {usuario.apellido || "REGISTRO"}
          </h3>
          <div
            style={styles.phoneBadge}
            onClick={() => copiarAlPortapapeles(usuario.telefono)}
          >
            <FaPhoneAlt size={10} color="#2D5A27" />
            <span style={{ fontSize: "15px", fontWeight: "400" }}>
              {usuario.telefono || "---"}
            </span>
            <FaCopy size={12} color="#999" />
          </div>
        </div>
        <div
          style={getBadgeStyle ? getBadgeStyle(textoStatus, diasRestantes) : {}}
        >
          {textoStatus}
        </div>
      </div>

      <div style={styles.infoList}>
        <InfoRow
          icon={<FaShieldAlt size={14} />}
          label="ROL"
          value={usuario.rol || "Sin asignar"}
        />

        <div
          style={{...styles.infoRow, cursor: "pointer"}}
          onClick={() => copiarAlPortapapeles(usuario.grupo_id)}
        >
          <div style={styles.iconCircle}>
            <FaLayerGroup size={14} />
          </div>
          <div style={styles.textStack}>
            <label style={styles.label}>
              GRUPO: {usuario.nombre_grupo_format || "Individual"}
            </label>
            <span style={styles.value}>
              ID: {usuario.grupo_id || "Sin grupo"}
            </span>
          </div>
          <FaCopy color="#CCC" size={12} />
        </div>

        <InfoRow
          icon={<BsCalendar2Check size={14} />}
          label="SUBSCRIPCIÓN"
          value={
            usuario.suscripcion_vence
              ? `${formatearFecha(usuario.suscripcion_vence)}  (${diasRestantes} días)`
              : "Sin suscripción activa"
          }
          valueStyle={{ color: diasRestantes > 5 ? "#2D5A27" : "#C62828" }}
        />

        <InfoRow
          icon={<FaUserLock size={14} />}
          label="MODO DE ACCESO PERMITIDO"
          content={
            <div style={styles.deviceIconsRow}>
              {/* SOLO MOVIL */}
              <div style={styles.modeIconWrapper}>
                <FaMobileAlt style={getModeStyle(modo === "solo_movil")} />
              </div>
              {/* SOLO LAPTOP */}
              <div style={styles.modeIconWrapper}>
                <FaLaptop style={getModeStyle(modo === "solo_laptop")} />
              </div>
              {/* SESION UNICA 1S */}
              <div style={styles.modeIconWrapper}>
                <span style={getModeStyle(modo === "sesion_unica")}>1S</span>
              </div>
              {/* DOBLE EQUIPO 2S */}
              <div style={styles.modeIconWrapper}>
                <span style={getModeStyle(modo === "doble_dispositivo")}>
                  2S
                </span>
              </div>
              {/* LIBRE */}
              <div style={styles.modeIconWrapper}>
                <FaUsers style={getModeStyle(modo === "libre")} />
              </div>
            </div>
          }
        />

        <InfoRow
          icon={<FaMicrochip size={14} />}
          label="HARDWARE VINCULADO"
          content={
            <div style={styles.deviceIconsRow}>
              <div style={styles.hwItem}>
                <FaMobileAlt
                  style={{ color: usuario.id_movil ? "#2D5A27" : "#DDD" }}
                />
                <span
                  style={{
                    fontSize: "8px",
                    color: usuario.id_movil ? "#2D5A27" : "#AAA",
                  }}
                >
                  Móvil
                </span>
              </div>
              <div style={styles.hwItem}>
                <FaLaptop
                  style={{ color: usuario.id_laptop ? "#2D5A27" : "#DDD" }}
                />
                <span
                  style={{
                    fontSize: "8px",
                    color: usuario.id_laptop ? "#2D5A27" : "#AAA",
                  }}
                >
                  PC
                </span>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, content, valueStyle }) => (
  <div style={styles.infoRow}>
    <div style={styles.iconCircle}>{icon}</div>
    <div style={styles.textStack}>
      <label style={styles.label}>{label}</label>
      {content ? (
        content
      ) : (
        <span style={{ ...styles.value, ...valueStyle }}>{value}</span>
      )}
    </div>
  </div>
);

const styles = {
  mirrorCard: {
    background: "white",
    borderRadius: "15px",
    padding: "1.2rem",
    border: "1px solid #2D5A27",
    marginBottom: "1rem",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.2rem",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "#F0F4F1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#2D5A27",
    fontWeight: "bold",
  },
  userMainInfo: { flex: 1 },
  userName: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1A2E26",
  },
  phoneBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#F5F5F5",
    padding: "2px 8px",
    borderRadius: "4px",
    width: "fit-content",
    cursor: "pointer",
    marginTop: "4px",
  },
  infoList: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    background: "#F8F9F8",
    padding: "10px",
    borderRadius: "10px",
  },
  iconCircle: { color: "#2D5A27" },
  textStack: { display: "flex", flexDirection: "column", flex: 1 },
  label: {
    fontSize: "0.6rem",
    color: "#999",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  value: { fontSize: "0.85rem", color: "#333", fontWeight: "600" },
  deviceIconsRow: {
    display: "flex",
    gap: "10px",
    marginTop: "5px",
    alignItems: "center",
  },
  modeIconWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "15px",
  },
  hwItem: { display: "flex", flexDirection: "column", alignItems: "center" },
};
