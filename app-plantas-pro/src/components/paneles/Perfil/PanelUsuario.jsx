import { useState, useEffect, useContext } from "react";
import {
  FaLaptop,
  FaMobileAlt,
  FaUser,
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
import { Copyright } from "../../ui/Copyright";
import "./PanelUsuario.css";

export const PanelUsuario = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { verificarSesion } = useContext(AuthContext);

  useEffect(() => {
    const cargarTodo = async () => {
      const gId = user?.grupo_id || user?.id_grupo || user?.grupos?.id;
      if (user?.id) {
        const data = await getDashboardStats(user.id, gId || null);
        setStats(data);
      }
      setLoading(false);
    };
    if (user) cargarTodo();
    if (verificarSesion) verificarSesion();
  }, [user, verificarSesion]);

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
    if (pct >= 50) return <FaMedal style={{ color: "#FFD700" }} />;
    if (pct >= 30) return <FaMedal style={{ color: "#C0C0C0" }} />;
    if (pct >= 15) return <FaMedal style={{ color: "#CD7F32" }} />;
    if (total > 5) return <PiMedal style={{ color: "#52b788" }} />;
    return null;
  };

  const getEstilosSuscripcion = (dias) => {
    if (dias <= 7) return { bg: "#fee2e2", text: "#b91c1c", border: "#ef4444" };
    if (dias <= 30)
      return { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" };
    return { bg: "#dcfce7", text: "#15803d", border: "#10b981" };
  };

  const estilos = getEstilosSuscripcion(diasRestantes);

  if (loading && !user) return <div className="loader-msg">Cargando...</div>;

  return (
    <div className="panel-custom-font">
      <div className="panel-container">
        {/* HEADER */}
        <div className="card-mirror profile-header-v3">
          <div className="avatar-wrapper-v3">
            <div className="avatar-circle">
              {user?.nombre?.charAt(0).toUpperCase() || "U"}
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
            <h2>{user?.alias || "Socio"}</h2>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        {stats && (
          <div className="card-mirror">
            <h3 className="section-title-v3">
              <FaChartLine />{" "}
              {user?.grupo_id ? "Impacto Grupal" : "Mi Actividad Personal"}
            </h3>
            <div className="chart-center-v3">
              <div
                className="donut-chart-v3"
                style={{
                  background: `conic-gradient(#2d6a4f ${(user?.grupo_id ? stats.participacion.porcentaje : 100) * 3.6}deg, #f1f5f9 0deg)`,
                }}
              >
                <div className="donut-inner-v3">
                  <span className="pct-v3">
                    {user?.grupo_id ? stats.participacion.porcentaje : 100}%
                  </span>
                  <span className="label-v3">Aporte</span>
                </div>
              </div>
            </div>
            <div className="bars-container-v3">
              <BarGrid
                label="Hoy"
                u={stats.individual.hoy}
                g={user?.grupo_id ? stats.grupal.hoy : stats.individual.hoy}
              />
              <BarGrid
                label="Semana"
                u={stats.individual.semana}
                g={
                  user?.grupo_id ? stats.grupal.semana : stats.individual.semana
                }
              />
              <BarGrid
                label="Mes"
                u={stats.individual.mes}
                g={user?.grupo_id ? stats.grupal.mes : stats.individual.mes}
              />
              <BarGrid
                label="Total"
                u={stats.individual.total}
                g={user?.grupo_id ? stats.grupal.total : stats.individual.total}
              />
            </div>
          </div>
        )}

        {/* DETALLES DE CUENTA */}
        <div className="card-mirror">
          <h3 className="section-title-v3">
            <BsCalendar2Check /> Detalles de la cuenta
          </h3>
          <div className="data-stack-v3">
            <DetailItem
              icon={<FaUser />}
              label="Nombre"
              value={`${user?.nombre || ""} ${user?.apellido || ""}`}
            />
            <DetailItem
              icon={<FaCheckCircle />}
              label="Status"
              value={user?.status}
            />
            <DetailItem icon={<FaShieldAlt />} label="Rol" value={user?.rol} />
            <DetailItem
              icon={<FaLayerGroup />}
              label="Grupo"
              value={
                user?.grupos?.nombre_grupo || user?.grupo_id || "Uso Individual"
              }
            />
            <DetailItem
              icon={<FaClock />}
              label="Suscripción"
              value={formatearFechaLocal(user?.suscripcion_vence)}
            />

            <div
              className="expiry-alert-v3"
              style={{ backgroundColor: estilos.bg, color: estilos.text }}
            >
              <span>Tiempo restante:</span>
              <strong>{diasRestantes} días</strong>
            </div>
          </div>
        </div>

        {/* SEGURIDAD DE ACCESO */}
        <div className="card-mirror">
          <h3 className="section-title-v3">
            <FaUserLock /> Seguridad de Acceso
          </h3>
          <div className="sec-mode-v3" style={{ marginBottom: 0 }}>
            <FaShieldAlt /> Modo:{" "}
            <strong>{user?.modo_acceso?.replace("_", " ")}</strong>
          </div>
        </div>

        {/* DISPOSITIVOS ASOCIADOS */}
        <div className="card-mirror">
          <h3 className="section-title-v3">
            <FaLaptop /> Dispositivos Asociados
          </h3>
          <div className="device-info-v3">
            <DeviceItem
              icon={<FaMobileAlt />}
              title="Móvil"
              desc={user?.id_movil || "No vinculado"}
              active={!!user?.id_movil}
            />
            <DeviceItem
              icon={<FaLaptop />}
              title="Laptop"
              desc={user?.id_laptop || "No vinculado"}
              active={!!user?.id_laptop}
            />
          </div>
        </div>

        {/* COPYRIGHT */}
        <div style={{ marginTop: "15px", paddingBottom: "20px", opacity: 0.8 }}>
          <Copyright colorTexto="#6B7280" />
        </div>
      </div>
    </div>
  );
};

const DeviceItem = ({ icon, title, desc, active }) => (
  <div className={`device-card-v3 ${active ? "active" : ""}`}>
    {icon}
    <div style={{ flex: 1 }}>
      <strong>{title}</strong>
      <p style={{ marginTop: "2px" }}>{desc}</p>
    </div>
  </div>
);

const BarGrid = ({ label, u, g }) => (
  <div className="bar-grid-v3">
    <span className="bar-tag-v3">{label}</span>
    <div className="bar-rail-v3">
      <div
        className="bar-progress-v3"
        style={{ width: `${(u / (g || 1)) * 100}%` }}
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
