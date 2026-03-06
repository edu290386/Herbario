import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { PlantasContext } from "../../context/PlantasContext";
import {
  normalizarParaBusqueda,
  formatearParaDB,
} from "../../helpers/textHelper";
import { resaltarTexto } from "../../helpers/highLightText"; // <-- Importamos tu helper
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
import { PanelLogs }  from "../../components/paneles/PanelLogs";
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

  const queryParams = new URLSearchParams(location.search);
  const paginaActual = parseInt(queryParams.get("page")) || 1;
  const itemsPorPagina = 12;

  const [busqueda, setBusqueda] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [tipoPanel, setTipoPanel] = useState(null);

  useEffect(() => {
    cargarPlantasHome(true);
  }, [cargarPlantasHome]);

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

  const abrirPanel = (tipo) => {
    setTipoPanel(tipo);
    setIsPanelOpen(true);
  };

  const cambiarPagina = (num) => {
    navigate(`?page=${num}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const totalPaginas = Math.ceil(filtradas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;

  // Lógica abstraída para limpieza visual
  const mostrarMinimalista = filtradas.length > 20 && busqueda.length >= 2;
  const plantasParaMostrar =
    busqueda.length >= 2
      ? filtradas
      : filtradas.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const CONFIG_PANELES = {
    usuario: {
      titulo: "Mi Perfil",
      icono: TbCloverFilled,
      componente: <PanelUsuario user={user} />,
    },
    accesos: {
      titulo: "Control de Accesos",
      icono: FaRegUserCircle,
      componente: <ControlAccesos admin={user} />,
    },
    actividades: {
      titulo: "Historial de Actividades",
      icono: FaRegBell,
      componente: <PanelLogs tipo="actividades" user={user} />,
    },
    gestion: {
      titulo: "Control de Aportes",
      icono: LuMicroscope,
      componente: <PanelLogs tipo="gestion" user={user} />,
    },
  };

  // Obtenemos la configuración actual basada en el estado
  const configActual = CONFIG_PANELES[tipoPanel] || {};    
      
  return (
    <div className="home-page">
      <BaseDrawer
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={configActual.titulo || "Panel"}
        icon={configActual.icono || TbCloverFilled}
      >
        {/* 1. Perfil y Estadísticas */}
        {tipoPanel === "usuario" && <PanelUsuario user={user} />}

        {/* 2. Gestión de Usuarios */}
        {tipoPanel === "accesos" && <ControlAccesos admin={user} />}

        {/* 3. Muro Social / Noticias (El que lee solo de la tabla 'logs') */}
        {tipoPanel === "actividades" && (
          <PanelLogs tipo="actividades" user={user} />
        )}
      </BaseDrawer>

      <div className="home-layout-container">
        {/* TOP BAR */}
        <div className="home-top-bar">
          {/* 1. MI PERFIL / ESTADÍSTICAS (Abierto a todos) */}
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
            {/* 2. CONTROL DE ACCESOS (Exclusivo para Administrador) */}
            {user?.rol === "Administrador" && (
              <button
                onClick={() => abrirPanel("accesos")}
                className="icon-btn"
              >
                <FaRegUserCircle size={22} color={colores.frondoso} />
              </button>
            )}

            {/* 3. HISTORIAL DE ACTIVIDADES (Abierto a todos - Muro del grupo) */}
            <button
              onClick={() => abrirPanel("actividades")}
              className="icon-btn"
            >
              <FaRegBell size={20} color={colores.frondoso} />
            </button>

            {/* 4. CONTROL DE APORTES (NUEVO: ¡Abierto a todos!) */}
            <button
              onClick={() => navigate("/aportes")} // ➔ ¡Magia simple y limpia!
              className="icon-btn"
            >
              <LuMicroscope size={22} color={colores.frondoso} />
            </button>

            {/* 5. CERRAR SESIÓN */}
            <button onClick={logout} className="icon-btn logout-sep">
              <IoLogOutOutline size={26} />
            </button>
          </div>
        </div>

        {/* BUSCADOR */}
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

        {/* ÁREA PRINCIPAL */}
        <main className="main-content-layout">
          {busqueda.length >= 2 && (
            <div className="search-feedback-container">
              <StatusBanner
                status={
                  existeExacta
                    ? "info"
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

          {/* Grid de Cards (Lógica simplificada) */}
          <div
            className={`${mostrarMinimalista ? "minimalist-list" : "home-grid"} grid-transition`}
          >
            {plantasParaMostrar.map((p) =>
              mostrarMinimalista ? (
                <div
                  key={p.id}
                  className="minimalist-item"
                  onClick={() => navigate(`/planta/${p.id}`)}
                >
                  <div>
                    {/* Usamos tu helper directamente */}
                    <strong>
                      {resaltarTexto(p.nombres_planta[0], busqueda)}
                    </strong>
                    <p style={{ fontSize: "0.8rem", color: "#666" }}>
                      {p.nombre_cientifico}
                    </p>
                  </div>
                  <IoChevronForward color={colores.frondoso} />
                </div>
              ) : (
                <CardPlanta key={p.id} planta={p} busqueda={busqueda} />
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
