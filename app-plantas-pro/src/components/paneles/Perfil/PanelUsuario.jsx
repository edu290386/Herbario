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
} from "react-icons/fa";
import { BsCalendar2Check } from "react-icons/bs";
import { getDashboardStats } from "./getDashboardStats";
import { AuthContext } from "../../../context/AuthContext";
import { formatearFechaLocal } from "../../../helpers/timeHelper";
import "./PanelUsuario.css";

export const PanelUsuario = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { verificarSesion } = useContext(AuthContext);

  useEffect(() => {
    if (verificarSesion) verificarSesion();
  }, [verificarSesion]);

  useEffect(() => {
    const cargarTodo = async () => {
      // Detección flexible del ID de grupo
      const gId = user?.grupo_id || user?.id_grupo || user?.grupos?.id;

      if (user?.id && gId) {
        const data = await getDashboardStats(user.id, gId);
        setStats(data);
      }
      // Siempre apagamos el loader si ya hay un intento de carga
      setLoading(false);
    };

    if (user) {
      cargarTodo();
    }
  }, [user]);

  const diasRestantes = user?.suscripcion_vence
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.suscripcion_vence) - new Date()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const getDescripcionModo = (m) => {
    const modos = {
      solo_movil: "1 dispositivo móvil permitido",
      solo_laptop: "1 laptop/PC permitida",
      sesion_unica: "1 Sesión activa (Móvil o Laptop)",
      doble_dispositivo: "2 dispositivos simultáneos",
      libre: "Acceso sin restricciones",
    };
    return modos[m] || "No especificado";
  };

  if (loading && !user)
    return <div className="loader-msg">Sincronizando portal...</div>;

  return (
    <div className="panel-container">
      {/* IDENTIDAD */}
      <div className="card-mirror profile-main">
        <div className="avatar-large">
          {user?.nombre?.charAt(0).toUpperCase()}
        </div>
        <h2 className="user-alias">{user?.alias || "Usuario"}</h2>
        <p className="user-fullname">
          {user?.nombre} {user?.apellido}
        </p>
        <div className={`badge-status ${user?.status?.toLowerCase()}`}>
          {user?.status}
        </div>
      </div>

      {/* DETALLES */}
      <div className="card-mirror">
        <h3 className="section-title">
          <FaIdCard /> Detalles de Cuenta
        </h3>
        <div className="info-list">
          <InfoRow
            icon={<FaPhoneAlt />}
            label="Teléfono"
            value={user?.telefono}
          />
          <InfoRow
            icon={<FaLayerGroup />}
            label="Grupo"
            value={user?.grupo || "Individual"}
          />
          <InfoRow icon={<FaShieldAlt />} label="Rol" value={user?.rol} />
          <InfoRow
            icon={<BsCalendar2Check />}
            label="Vencimiento"
            value={formatearFechaLocal(user?.suscripcion_vence)}
          />
          <InfoRow
            icon={<FaClock />}
            label="Restan"
            value={`${diasRestantes} días`}
            isAlert={diasRestantes < 5}
          />
        </div>
      </div>

      {/* SEGURIDAD */}
      <div className="card-mirror">
        <h3 className="section-title">
          <FaUserLock /> Seguridad
        </h3>
        <div className="security-vertical-stack">
          <div className="description-row">
            <span className="icon-main">
              <FaUserLock />
            </span>
            <span className="text-desc">
              {getDescripcionModo(user?.modo_acceso)}
            </span>
          </div>
          <div className="hw-description-stack">
            <div className={`hw-row ${!user?.id_movil && "inactive"}`}>
              <FaMobileAlt />{" "}
              <span>{user?.id_movil ? "Móvil vinculado" : "Sin móvil"}</span>
            </div>
            <div className={`hw-row ${!user?.id_laptop && "inactive"}`}>
              <FaLaptop />{" "}
              <span>{user?.id_laptop ? "Laptop vinculada" : "Sin laptop"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      {/* SECCIÓN 4: ESTADÍSTICAS */}
      {stats && (
        <div className="card-mirror stats-card-container">
          <div className="stats-main-header">
            <FaChartLine /> ESTADÍSTICA DE REGISTROS
          </div>
          <div className="comparison-grid">
            <div className="stat-column-box individual-border">
              <h4 className="column-title">Mis Aportes</h4>
              <StatLine label="Hoy" value={stats.individual.hoy} isMain />
              <StatLine label="Semana" value={stats.individual.semana} />
              <StatLine label="Mes" value={stats.individual.mes} />
              <StatLine label="Año" value={stats.individual.año} />
            </div>
            <div className="stat-column-box">
              <h4 className="column-title">Grupo</h4>
              <StatLine label="Hoy" value={stats.grupal.hoy} isMain isGroup />
              <StatLine label="Semana" value={stats.grupal.semana} isGroup />
              <StatLine label="Mes" value={stats.grupal.mes} isGroup />
              <StatLine label="Año" value={stats.grupal.año} isGroup />
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 5: IMPACTO EN EL GRUPO */}
      {stats?.participacion && (
        <div className="card-mirror impact-card">
          <h3 className="section-title">
            <FaChartLine /> Tu Impacto en el Grupo
          </h3>
          <div className="impact-container">
            <div className="impact-info">
              <span>
                Has aportado el{" "}
                <strong>{stats.participacion.porcentaje}%</strong> de los datos
              </span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${stats.participacion.porcentaje}%` }}
              ></div>
            </div>
            <p className="impact-footer">
              {stats.participacion.misTotal}  {stats.participacion.totalGrupo}{" "}
            
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value, isAlert }) => (
  <div className="info-row-unit">
    <label>
      {icon} {label}
    </label>
    <span className={isAlert ? "text-danger" : ""}>{value || "---"}</span>
  </div>
);

const StatLine = ({ label, value, isMain, isGroup }) => (
  <div className={`stat-metric-row ${isMain ? "main-row" : ""}`}>
    <span className="label-text">{label}</span>
    <strong className={`value-text ${isGroup ? "color-group" : "color-user"}`}>
      {value ?? 0}
    </strong>
  </div>
);