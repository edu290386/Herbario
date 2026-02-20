import { useState, useEffect } from "react";
import {
  FaCircleUser,
  FaUserGroup,
  FaNetworkWired,
  FaChartLine,
} from "react-icons/fa6";
import { getDashboardStats } from "./getDashboardStats";

export const PanelUsuario = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarTodo = async () => {
      const gId = user?.grupo_id || user?.grupos?.id || user?.id_grupo;
      if (user?.id && gId) {
        const data = await getDashboardStats(user.id, gId);
        setStats(data);
      }
      setLoading(false);
    };
    cargarTodo();
  }, [user]);

  if (loading)
    return <div className="loader-msg">Cargando estadísticas...</div>;
  if (!stats)
    return <div className="error-msg">Error al vincular con el grupo.</div>;

  return (
    <div className="panel-container">
      {/* BLOQUE 1: IDENTIDAD CENTRALIZADA */}
      <div className="block-identity-centered">
        <div className="main-user-info">
          <FaCircleUser
            size={45}
            color="var(--color-frondoso)"
            className="main-icon"
          />
          <h2 className="user-alias-center">{user?.alias || "Usuario"}</h2>
        </div>

        <div className="details-stack">
          {/* GRUPO */}
          <div className="detail-item">
            <span className="detail-label">Grupo</span>
            <div className="badge group-badge">
              <FaUserGroup size={12} />
              <span>{user?.grupos?.nombre_grupo || "Sin Grupo"}</span>
            </div>
          </div>

          {/* ROL */}
          <div className="detail-item">
            <span className="detail-label">Rol</span>
            <div className="badge role-badge">
              <FaNetworkWired size={12} />
              <span>{user?.rol || "Sin Rol"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: COMPARATIVA DE APORTES */}
      <div className="block-stats">
        <div className="stats-header">
          <FaChartLine size={12}/> ESTADÍSTICA DE REGISTROS
        </div>

        <div className="comparison-layout">
          <div className="stat-col individual">
            <h3>Mis Aportes</h3>
            <div className="stat-row">
              <span>Hoy</span> <strong>{stats.individual.hoy}</strong>
            </div>
            <div className="stat-row">
              <span>Semana</span> <strong>{stats.individual.semana}</strong>
            </div>
            <div className="stat-row">
              <span>Mes</span> <strong>{stats.individual.mes}</strong>
            </div>
            <div className="stat-row">
              <span>Año</span> <strong>{stats.individual.año}</strong>
            </div>
          </div>

          <div className="stat-col group">
            <h3>Total Grupo</h3>
            <div className="stat-row">
              <span>Hoy</span> <strong>{stats.grupal.hoy}</strong>
            </div>
            <div className="stat-row">
              <span>Semana</span> <strong>{stats.grupal.semana}</strong>
            </div>
            <div className="stat-row">
              <span>Mes</span> <strong>{stats.grupal.mes}</strong>
            </div>
            <div className="stat-row">
              <span>Año</span> <strong>{stats.grupal.año}</strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .panel-container { padding: 5px; max-width: 100%; }
        
        /* Bloque de Identidad Centralizado */
        .block-identity-centered { 
          background: white; padding: 25px 20px; border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px;
          text-align: center; border: 1px solid #f0f0f0;
        }
        
        .main-user-info { margin-bottom: 5px; }
        .main-icon { margin-bottom: 0px; }
        .user-alias-center { margin: 0; font-size: 1.6rem; color: #2d3436; font-weight: 700; }
        
        .details-stack { display: flex; flex-direction: column; gap: 15px; text-align: left; }
        
        .detail-item { display: flex; flex-direction: column; gap: 5px; }
        .detail-label { font-size: 0.7rem; font-weight: bold; text-transform: uppercase; color: #b2bec3; letter-spacing: 0.5px; margin-left: 2px; }
        
        .badge { 
          font-size: 0.8rem; padding: 8px 14px; border-radius: 10px; 
          display: flex; align-items: center; gap: 10px; font-weight: 500;
          width: 50%; box-sizing: border-box; justify-content:center;
        }
        
        .group-badge { background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; }
        .role-badge { background: #f3e5f5; color: #7b1fa2; border: 1px solid #e1bee7; }

        /* Estilos Estadísticas */
        .block-stats { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #eee; }
        .stats-header { background: #fcfcfc; padding: 12px; text-align: center; font-size: 0.75rem; font-weight: bold; color: #95a5a6; border-bottom: 1px solid #eee; }
        .comparison-layout { display: grid; grid-template-columns: 1fr 1fr; }
        .stat-col { padding: 20px 10px; }
        .stat-col h3 { font-size: 0.65rem; text-transform: uppercase; margin-bottom: 15px; text-align: center; color: #bdc3c7; }
        .individual { border-right: 1px solid #f0f0f0; }
        .stat-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.85rem; }
        .stat-row strong { font-size: 1.1rem; color: var(--color-bosque); }
        .group strong { color: var(--color-bosque); }
        
        .loader-msg, .error-msg { padding: 40px; text-align: center; }
      `}</style>
    </div>
  );
};