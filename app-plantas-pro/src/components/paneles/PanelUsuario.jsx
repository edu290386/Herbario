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
            size={50}
            color="#2D8B57"
            className="main-icon"
            style={{ marginBottom: "10px" }}
          />
          <h2 className="user-alias-center">{user?.alias || "Usuario"}</h2>
        </div>

        <div className="details-stack">
          {/* GRUPO */}
          <div className="detail-item">
            <span className="detail-label">Grupo</span>
            <div className="badge group-badge">
              <FaUserGroup size={14} />
              <span>{user?.grupos?.nombre_grupo || "Sin Grupo"}</span>
            </div>
          </div>

          {/* ROL */}
          <div className="detail-item">
            <span className="detail-label">Rol</span>
            <div className="badge role-badge">
              <FaNetworkWired size={14} />
              <span>{user?.rol || "Sin Rol"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: COMPARATIVA DE APORTES */}
      <div className="block-stats">
        <div className="stats-header">
          <FaChartLine size={12} /> ESTADÍSTICA DE REGISTROS
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
        .panel-container { 
          padding: 15px; 
          max-width: 100%; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-sizing: border-box;
        }
        
        .block-identity-centered { 
          background: white; 
          padding: 20px; 
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
          margin-bottom: 15px;
          text-align: center; 
          border: 1px solid #f0f0f0;
        }
        
        .main-user-info { margin-bottom: 15px; }
        .user-alias-center { margin: 0; font-size: 1.4rem; color: #1e3a2b; font-weight: 700; }
        
        .details-stack { display: flex; flex-direction: column; gap: 12px; }
        .detail-item { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
        .detail-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #a0a0a0; letter-spacing: 0.8px; }
        
        .badge { 
          font-size: 0.85rem; 
          padding: 10px 12px; 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-weight: 600;
          width: 100%; /* Ajustado para ocupar el ancho disponible */
          box-sizing: border-box;
          border: 1px solid #e8e8e8;
        }
        
        .group-badge { background: #f7fcf9; color: #2d6a4f; border-color: #d8f3dc; }
        .role-badge { background: #f7fcf9; color: #2d6a4f; border-color: #d8f3dc; }

        .block-stats { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .stats-header { background: #2D8B57; padding: 10px; text-align: center; font-size: 0.7rem; font-weight: 800; color: white; letter-spacing: 1px; }
        
        .comparison-layout { display: grid; grid-template-columns: 1fr 1fr; }
        .stat-col { padding: 15px 10px; }
        .stat-col h3 { font-size: 0.6rem; text-transform: uppercase; margin-bottom: 12px; text-align: center; color: #95a5a6; font-weight: 800; }
        .individual { border-right: 1px solid #f0f0f0; }
        
        .stat-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem; color: #4a4a4a; }
        .stat-row strong { font-size: 1rem; color: #2D8B57; }
        
        .loader-msg, .error-msg { padding: 40px; text-align: center; color: #636e72; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};