import { useState, useEffect, useContext } from "react";
import {
  FaLaptop,
  FaMobileAlt,
  FaPhoneAlt,
  FaIdCard,
  FaLayerGroup,
  FaClock,
  FaUserLock,
  FaShieldAlt,
  FaChartLine,
  FaCheckCircle,
  FaMedal,
} from "react-icons/fa";
import { PiMedal } from "react-icons/pi";
import { BsCalendar2Check } from "react-icons/bs";
import { getDashboardStats } from "./getDashboardStats";
import { AuthContext } from "../../../context/AuthContext";
import { formatearFechaLocal } from "../../../helpers/timeHelper";
import {
  detectarTipoCampo,
  getCleanHardwareName,
} from "../../../helpers/hardwareHelper";
import "./PanelUsuario.css";

export const PanelUsuario = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { verificarSesion } = useContext(AuthContext);

  // 1. Obtenemos la info real del equipo donde el usuario está parado
  const tipoActual = detectarTipoCampo(); 
  const nombreRealActual = getCleanHardwareName();

  useEffect(() => {
    if (verificarSesion) verificarSesion();
  }, [verificarSesion]);

  useEffect(() => {
    const cargarTodo = async () => {
      const gId = user?.grupo_id || user?.id_grupo || user?.grupos?.id;
      if (user?.id && gId) {
        const data = await getDashboardStats(user.id, gId);
        setStats(data);
      }
      setLoading(false);
    };
    if (user) cargarTodo();
  }, [user]);

  // ... (tus lógicas de díasRestantes, renderMedal y getEstilosSuscripcion se mantienen igual)
  const diasRestantes = user?.suscripcion_vence
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.suscripcion_vence) - new Date()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const renderMedal = (pct, total) => {
    if (pct >= 50)
      return <FaMedal title="Primer Aportante" style={{ color: "#FFD700" }} />;
    if (pct >= 30)
      return <FaMedal title="Segundo Aportante" style={{ color: "#C0C0C0" }} />;
    if (pct >= 15)
      return <FaMedal title="Tercer Aportante" style={{ color: "#CD7F32" }} />;
    if (total > 5)
      return (
        <PiMedal title="Explorador Constante" style={{ color: "#52b788" }} />
      );
    return null;
  };

  const getEstilosSuscripcion = (dias) => {
    if (dias <= 7) return { bg: "#fee2e2", text: "#b91c1c", border: "#ef4444" };
    if (dias <= 30)
      return { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" };
    return { bg: "#dcfce7", text: "#15803d", border: "#10b981" };
  };

  const estilos = getEstilosSuscripcion(diasRestantes);

  if (loading && !user)
    return <div className="loader-msg">Cargando perfil...</div>;

  return (
    <div className="panel-custom-font">
      <div className="panel-container">
        {/* ... HEADER e IMPACTO GRUPAL (Igual que antes) ... */}
        <div className="card-mirror profile-header-v3">
          <div className="avatar-wrapper-v3">
            <div className="avatar-circle">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="medal-badge-v3">
              {stats &&
                renderMedal(
                  stats.participacion.porcentaje,
                  stats.individual.total,
                )}
            </div>
          </div>
          <div className="header-info-v3">
            <h2>{user?.alias || "Usuario"}</h2>
            <div className="status-tag-v3">
              <FaCheckCircle /> {user?.status}
            </div>
          </div>
        </div>

        {stats && (
          <div className="card-mirror">
            <h3 className="section-title-v3">
              <FaChartLine /> Impacto Grupal
            </h3>
            <div className="chart-center-v3">
              <div
                className="donut-chart-v3"
                style={{
                  background: `conic-gradient(#2d6a4f ${stats.participacion.porcentaje * 3.6}deg, #f1f5f9 0deg)`,
                }}
              >
                <div className="donut-inner-v3">
                  <span className="pct-v3">
                    {stats.participacion.porcentaje}%
                  </span>
                  <span className="label-v3">Aporte</span>
                </div>
              </div>
            </div>
            <div className="bars-container-v3">
              <BarGrid
                label="Hoy"
                u={stats.individual.hoy}
                g={stats.grupal.hoy}
              />
              <BarGrid
                label="Semana"
                u={stats.individual.semana}
                g={stats.grupal.semana}
              />
              <BarGrid
                label="Mes"
                u={stats.individual.mes}
                g={stats.grupal.mes}
              />
            </div>
          </div>
        )}

        {/* CUENTA */}
        <div className="card-mirror">
          <h3 className="section-title-v3">
            <BsCalendar2Check /> Detalles de la cuenta
          </h3>
          <div className="data-stack-v3">
            <DetailItem
              icon={<FaPhoneAlt />}
              label="Contacto"
              value={user?.telefono}
            />
            <DetailItem
              icon={<FaLayerGroup />}
              label="Grupo"
              value={user?.grupo}
            />
            <DetailItem
              icon={<FaClock />}
              label="Expira"
              value={formatearFechaLocal(user?.suscripcion_vence)}
            />
            <div
              className="expiry-alert-v3"
              style={{
                backgroundColor: estilos.bg,
                borderLeftColor: estilos.border,
                color: estilos.text,
              }}
            >
              Vencimiento en: <strong>{diasRestantes} días</strong>
            </div>
          </div>
        </div>

        {/* SEGURIDAD DE ACCESO */}
        <div className="card-mirror">
          <h3 className="section-title-v3"><FaUserLock /> Seguridad de Acceso</h3>
          <div className="security-wrap-v3">
            <div className="sec-mode-v3">
              <FaShieldAlt /> Modo: <strong>{user?.modo_acceso?.replace("_", " ")}</strong>
            </div>
            <div className="device-info-v3">
              <p className="device-label-v3">Dispositivos Vinculados:</p>
              
              <DeviceItem
                icon={<FaMobileAlt />}
                title="Móvil"
                desc={user?.id_movil || "No vinculado"}
                active={user?.id_movil}
                isCurrent={tipoActual === "id_movil"} // Usamos la variable definida arriba
                isMatch={user?.id_movil === nombreRealActual}
              />

              <DeviceItem
                icon={<FaLaptop />}
                title="Laptop"
                desc={user?.id_laptop || "No vinculado"}
                active={user?.id_laptop}
                isCurrent={tipoActual === "id_laptop"} // Usamos la variable definida arriba
                isMatch={user?.id_laptop === nombreRealActual}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// COMPONENTES AUXILIARES
const DeviceItem = ({ icon, title, desc, active, isCurrent, isMatch }) => (
  <div className={`device-card-v3 ${active ? "active" : ""} ${isCurrent ? "current" : ""}`}>
    {icon}
    <div>
      <strong>
        {title} 
        {isCurrent && <span className="current-badge">En uso</span>}
      </strong>
      <p>
        {desc}
        {isCurrent && active && !isMatch && (
          <span style={{ color: "#f59e0b", display: "block", fontSize: "10px", marginTop: "4px" }}>
            ⚠️ El nombre no coincide con el registro original.
          </span>
        )}
      </p>
    </div>
  </div>
);

// ... (BarGrid y DetailItem se mantienen igual)
const BarGrid = ({ label, u, g }) => (
  <div className="bar-grid-v3">
    <span className="bar-tag-v3">{label}</span>
    <div className="bar-rail-v3">
      <div
        className="bar-progress-v3"
        style={{ width: `${(u / g) * 100 || 0}%` }}
      ></div>
    </div>
    <span className="bar-numbers-v3">
      {u}
      <span>/{g}</span>
    </span>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="detail-item-v3">
    <div className="icon-box-v3">{icon}</div>
    <div className="text-box-v3">
      <label>{label}</label>
      <p>{value || "---"}</p>
    </div>
  </div>
);