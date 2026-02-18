import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardPlanta } from "../components/planta/CardPlanta";
import { formatearParaDB, normalizarParaBusqueda } from "../helpers/textHelper";
import { AuthContext } from "../context/AuthContext";
import { PlantasContext } from "../context/PlantasContext";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { StatusBanner } from "../components/ui/StatusBanner";
import {
  IoLogOutOutline,
  IoSearchOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { GiCircularSaw } from "react-icons/gi";
import { TbCloverFilled } from "react-icons/tb";
import { LogCard } from "../components/logs/LogCard"; // Ajusta la ruta
import {
  getLogs,
  processProposal,
} from "../services/plantasServices";
import {
  FaRegBell,
  FaRegCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaSeedling,
} from "react-icons/fa";
import { GiCircularSawblade } from "react-icons/gi";
import { colores } from "../constants/tema";

export const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { plantas, cargarPlantasHome } = useContext(PlantasContext);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // ESTADOS PARA EL PANEL (DRAWER)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [tipoPanel, setTipoPanel] = useState(null); // 'actividades' o 'gestion'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. El useEffect llama a la función de forma segura al montar el componente
  useEffect(() => {
    //Para limpiar la busqueda (solo filtra un card) luego de agregar ubicacion en detallepage
    const timeout = setTimeout(() => {
      setBusqueda("");
    }, 0);
    cargarPlantasHome();
    return () => clearTimeout(timeout);
  }, [cargarPlantasHome]);

  // FUNCIÓN PARA ABRIR Y CARGAR
  const togglePanel = async (tipo) => {
    if (!isPanelOpen || tipoPanel !== tipo) {
      setLoading(true);
      setTipoPanel(tipo);
      setIsPanelOpen(true);
      try {
        // getLogs ahora retorna { data, error }
        const { data, error } = await getLogs(tipo);

        if (error) {
          console.error(`Error en descartes de ${tipo}:`, error.message);
          return;
        }
        setLogs(data || []);
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setIsPanelOpen(false);
    }
  };

  const handleReview = async (log) => {
    // Solo los administradores activan esto al dar clic al Warning
    const res = await processProposal(log, "veredicto_final_admin", user);

    if (res.success) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === log.id
            ? {
                ...l,
                veredicto: "revisado",
                veredicto_por: user.alias,
                revisado: true,
              }
            : l,
        ),
      );
    }
  };

  const handleAction = async (log, accion) => {
    // accion es "aprobado" o "rechazado" (lo que viene del botón)
    const comando =
      accion === "aprobado"
        ? "filtro_operativo_aprobar"
        : "filtro_operativo_rechazar";

    const res = await processProposal(log, comando, user);

    if (res.success) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === log.id
            ? { ...l, revisado: true } // Veredicto sigue siendo null hasta que tú des clic al Warning
            : l,
        ),
      );

      if (accion === "aprobado") cargarPlantasHome();
    }
  };

  // 2. Lógica de filtrado para la búsqueda
  const busquedaNorm = busqueda ? normalizarParaBusqueda(busqueda) : "";

  // 3. Lógica de filtrado para la Galería (incluye coincidencias parciales)
  const plantasFiltradas = plantas.filter((p) => {
    if (busqueda === "") return true;

    // Solo busca dentro de la bolsa de nombres (Común + Secundarios)
    return p.nombres_planta?.some((n) =>
      normalizarParaBusqueda(n).includes(busquedaNorm),
    );
  });
  // 4. CONTROL DE ADMIN: ¿Existe ya este nombre exacto? True False
  const existeCoincidenciaExacta = plantas.some((p) =>
    p.nombres_planta?.some((n) => normalizarParaBusqueda(n) === busquedaNorm),
  );

  return (
    <div className="home-page">
      {/* OVERLAY OSCURO (Al hacer clic fuera, se cierra) */}
      <div
        className={`drawer-overlay ${isPanelOpen ? "active" : ""}`}
        onClick={() => setIsPanelOpen(false)}
      ></div>

      {/* EL PANEL DESLIZABLE (DRAWER) */}
      <aside className={`drawer-panel ${isPanelOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {tipoPanel === "actividades" ? (
              <>
                <FaRegBell size={24}/>
                <h3 style={{ margin: 0 }}>Historial de Actividades</h3>
              </>
            ) : (
              <>
                <GiCircularSawblade
                  size={28}
                  className="icon-spin"
                />
                <h3 style={{ margin: 0 }}>Panel de Control</h3>
              </>
            )}
          </div>

          <button
            onClick={() => setIsPanelOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#111111" }}
          >
            <IoCloseOutline size={30} />
          </button>
        </div>
        <div className="drawer-body">
          {loading ? (
            <p className="loading-text">Cargando...</p>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                userRole={user?.rol}
                panelType={tipoPanel}
                onAction={handleAction}
                onReview={handleReview}
              />
            ))
          ) : (
            <p className="empty-text">Sin registros recientes</p>
          )}
        </div>
      </aside>

      <div className="home-layout-container">
        <div className="home-top-bar">
          <div className="user-profile-info">
            <TbCloverFilled
              style={{ color: "var(--color-frondoso)", fontSize: "3rem" }}
            />
            <div className="user-text-details">
              <span className="user-name-text">{user?.alias}</span>
              <span className="user-role-text">
                {user?.grupos?.nombre_grupo || "Sin grupo"}
              </span>
            </div>
          </div>

          <div className="nav-actions">
            <button
              onClick={() => togglePanel("actividades")}
              className="icon-btn"
            >
              <FaRegBell size={30} color={colores.frondoso} />
            </button>
            {(user?.rol === "Administrador" || user?.rol === "Colaborador") && (
              <button
                onClick={() => togglePanel("gestion")}
                className="icon-btn"
              >
                <GiCircularSaw size={35} color={colores.frondoso}/>
              </button>
            )}
            <button onClick={logout} className="icon-btn logout-sep">
              <IoLogOutOutline size={40} />
            </button>
          </div>
        </div>

        {/* BUSCADOR: Crece hasta 2 cards */}
        <header className="search-section">
          <div className="search-wrapper">
            <IoSearchOutline className="search-icon" size={24} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar planta ..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </header>

        <main className="main-content-layout">
          {/* FEEDBACK Y REGISTRO: Crece hasta 2 cards */}
          {busqueda.length > 0 && (
            <div className="search-feedback-container">
              <div className="status-banner-wrapper">
                <StatusBanner
                  status={plantasFiltradas.length > 0 ? "success" : "warning"}
                  message={`${plantasFiltradas.length} coincidencias encontradas`}
                />
              </div>
              {!existeCoincidenciaExacta && (
                <div className="register-button-wrapper">
                  <BotonPrincipal
                    texto={`REGISTRAR NUEVA PLANTA`}
                    onClick={() =>
                      navigate("/registro", {
                        state: {
                          nombreComun: formatearParaDB(busqueda),
                          usuarioId: user.id,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* GALERÍA DE PLANTAS: Se adapta a las columnas */}
          {plantasFiltradas.length > 0 && (
            <div className="home-grid">
              {plantasFiltradas.map((p) => (
                <CardPlanta key={p.id} planta={p} busqueda={busqueda} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};