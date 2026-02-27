import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { PlantasContext } from "../../context/PlantasContext";
import { normalizarParaBusqueda, formatearParaDB } from "../../helpers/textHelper";
import { colores } from "../../constants/tema";
import "./HomePage.css";

// Iconos y UI
import {
  IoLogOutOutline,
  IoSearchOutline,
  IoChevronForward,
} from "react-icons/io5";
import { TbCloverFilled } from "react-icons/tb";
import { FaRegBell, FaRegUserCircle } from "react-icons/fa";
import { LuMicroscope } from "react-icons/lu";

// Componentes
import { BaseDrawer } from "../../components/paneles/BaseDrawer";
import { PanelLogs } from "../../components/paneles/PanelLogs";
import { PanelUsuario } from "../../components/paneles/Perfil/PanelUsuario";
import { CardPlanta } from "../../components/planta/CardPlanta";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { Paginador } from "./Paginador";
import { ControlAccesos } from "../../components/paneles/Accesos/ControlAccesos";

export const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { plantas, cargarPlantasHome } = useContext(PlantasContext);
  const navigate = useNavigate();
  const location = useLocation();

  // --- CONFIGURACIÓN DE PAGINACIÓN ---
  const queryParams = new URLSearchParams(location.search);
  const paginaActual = parseInt(queryParams.get("page")) || 1;
  const itemsPorPagina = 12; // Puedes subirlo a 20 o 30 según prefieras

  const [busqueda, setBusqueda] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [tipoPanel, setTipoPanel] = useState(null);

  useEffect(() => {
    cargarPlantasHome(true);
  }, [cargarPlantasHome]);

  // --- FILTRADO Y BÚSQUEDA ---
  const { filtradas, existeExacta } = useMemo(() => {
    const busquedaNorm = normalizarParaBusqueda(busqueda);
    if (busqueda.length < 2) return { filtradas: plantas, existeExacta: false };

    const resultados = plantas.filter((p) =>
      p.nombres_planta?.some((n) =>
        normalizarParaBusqueda(n).includes(busquedaNorm),
      ),
    );

    const exacta = plantas.some((p) =>
      p.nombres_planta?.some((n) => normalizarParaBusqueda(n) === busquedaNorm),
    );

    return { filtradas: resultados, existeExacta: exacta };
  }, [busqueda, plantas]);

  // --- LÓGICA DE NAVEGACIÓN Y PANELES ---
  const abrirPanel = (tipo) => {
    setTipoPanel(tipo);
    setIsPanelOpen(true);
  };

  const cambiarPagina = (num) => {
    navigate(`?page=${num}`);
    window.scrollTo({ top: 0, behavior: "auto" }); // 'auto' para que no se vea el salto con la animación
  };

  // --- CÁLCULO DE ÍTEMS A MOSTRAR ---
  const totalPaginas = Math.ceil(filtradas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;

  // Si busca (>=2 letras), mostramos todo el filtro (minimalista si > 20)
  // Si no busca, mostramos el slice de la página actual
  const plantasParaMostrar =
    busqueda.length >= 2
      ? filtradas
      : filtradas.slice(indiceInicio, indiceInicio + itemsPorPagina);

  // --- FUNCIÓN HIGHLIGHT (Resaltado) ---
  const renderNombreConHighlight = (nombre) => {
    if (!busqueda || busqueda.length < 2) return nombre;
    const parts = nombre.split(new RegExp(`(${busqueda})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === busqueda.toLowerCase() ? (
            <b
              key={i}
              className="highlight-text"
              style={{ color: colores.frondoso }}
            >
              {part}
            </b>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  return (
    <div className="home-page">
      <BaseDrawer
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={
          tipoPanel === "usuario"
            ? "Mi Perfil"
            : tipoPanel === "accesos"
              ? "Control de Accesos"
              : tipoPanel === "actividades"
                ? "Historial de Actividades"
                : tipoPanel === "gestion"
                  ? "Control de Aportes"
                  : "Panel"
        }
        icon={
          tipoPanel === "accesos"
            ? FaRegUserCircle
            : tipoPanel === "actividades"
              ? FaRegBell
              : tipoPanel === "gestion"
                ? LuMicroscope
                : TbCloverFilled
        }
      >
        {tipoPanel === "usuario" && <PanelUsuario user={user} />}
        {tipoPanel === "accesos" && <ControlAccesos admin={user} />}
        {(tipoPanel === "actividades" || tipoPanel === "gestion") && (
          <PanelLogs tipo={tipoPanel} user={user} />
        )}
      </BaseDrawer>

      <div className="home-layout-container">
        {/* 1. TOP BAR */}
        <div className="home-top-bar">
          <div
            className="user-profile-info"
            onClick={() => abrirPanel("usuario")}
          >
            <TbCloverFilled
              className="top-bar-clover"
              size={30}
              color={colores.frondoso}
            />
            <div className="user-text-details">
              <span className="user-name-text">{user?.alias}</span>
              <span className="user-role-text">
                {user?.grupos?.nombre_grupo || "Sin grupo"}
              </span>
            </div>
          </div>

          <div className="nav-actions">
            {user?.rol === "Administrador" && (
              <button
                onClick={() => abrirPanel("accesos")}
                className="icon-btn"
              >
                <FaRegUserCircle size={22} color={colores.frondoso} />
              </button>
            )}
            <button
              onClick={() => abrirPanel("actividades")}
              className="icon-btn"
            >
              <FaRegBell size={20} color={colores.frondoso} />
            </button>
            {(user?.rol === "Administrador" || user?.rol === "Colaborador") && (
              <button
                onClick={() => abrirPanel("gestion")}
                className="icon-btn"
              >
                <LuMicroscope size={22} color={colores.frondoso} />
              </button>
            )}
            <button onClick={logout} className="icon-btn logout-sep">
              <IoLogOutOutline size={26} />
            </button>
          </div>
        </div>

        {/* 2. BUSCADOR */}
        <header className="search-section">
          <div className="search-wrapper">
            <IoSearchOutline size={24} color="var(--color-frondoso)" />
            <input
              type="text"
              className="search-input"
              placeholder="¿Qué planta buscas hoy?"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </header>

        {/* 3. ÁREA PRINCIPAL */}
        <main className="main-content-layout">
          {/* Feedback de Búsqueda */}
          {busqueda.length >= 2 && (
            <div className="search-feedback-container">
              <StatusBanner
                status={
                  existeExacta
                    ? "error"
                    : filtradas.length > 0
                      ? "success"
                      : "warning"
                }
                message={
                  existeExacta
                    ? "Esta planta ya existe"
                    : `${filtradas.length} coincidencias`
                }
              />
              {!existeExacta && (
                <div className="register-button-wrapper">
                  <BotonPrincipal
                    texto="REGISTRAR NUEVA PLANTA"
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

          {/* Paginación Superior */}
          {busqueda.length < 2 && totalPaginas > 1 && (
            <div className="pagination-wrapper">
              <Paginador
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                alCambiarPagina={cambiarPagina}
              />
            </div>
          )}

          {/* Grid de Cards */}
          <div
            className={`${filtradas.length > 20 && busqueda.length >= 2 ? "minimalist-list" : "home-grid"} grid-transition`}
          >
            {plantasParaMostrar.map((p) =>
              filtradas.length > 20 && busqueda.length >= 2 ? (
                <div
                  key={p.id}
                  className="minimalist-item"
                  onClick={() => navigate(`/detalle/${p.id}`)}
                >
                  <div>
                    <strong>
                      {renderNombreConHighlight(p.nombres_planta[0])}
                    </strong>
                    <p style={{ fontSize: "0.8rem", color: "#666" }}>
                      {p.nombre_cientifico}
                    </p>
                  </div>
                  <IoChevronForward color={colores.frondoso} />
                </div>
              ) : (
                <CardPlanta
                  key={p.id}
                  planta={p}
                  renderNombre={renderNombreConHighlight}
                />
              ),
            )}
          </div>

          {/* Paginación Inferior */}
          {busqueda.length < 2 && totalPaginas > 1 && (
            <div className="pagination-wrapper">
              <Paginador
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                alCambiarPagina={cambiarPagina}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
