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
  IoChevronBack,
  IoChevronForward,
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5";
import { TbCloverFilled } from "react-icons/tb";
import { FaRegBell } from "react-icons/fa";
import { LuMicroscope } from "react-icons/lu";

// Componentes
import { BaseDrawer } from "../../components/paneles/BaseDrawer";
import { PanelLogs } from "../../components/paneles/PanelLogs";
import { PanelUsuario } from "../../components/paneles/PanelUsuario";
import { CardPlanta } from "../../components/planta/CardPlanta";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { BotonPrincipal } from "../../components/ui/BotonPrincipal";
import { Paginador } from "./Paginador";

export const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { plantas, cargarPlantasHome } = useContext(PlantasContext);
  const navigate = useNavigate();
  const location = useLocation();

  // --- LÓGICA DE URL PARA PAGINACIÓN ---
  const queryParams = new URLSearchParams(location.search);
  const paginaActual = parseInt(queryParams.get("page")) || 1;
  const itemsPorPagina = 12;

  const [busqueda, setBusqueda] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [tipoPanel, setTipoPanel] = useState(null);

  useEffect(() => {
    cargarPlantasHome(true);
  }, [cargarPlantasHome]);

  // --- FILTRADO AVANZADO (Lógica de los 2 caracteres) ---
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

  // --- LÓGICA DE PAGINACIÓN ---
  const totalPaginas = Math.ceil(filtradas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const plantasParaMostrar =
    busqueda.length >= 2
      ? filtradas
      : filtradas.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const cambiarPagina = (num) => {
    navigate(`?page=${num}`);
    // Opcional: Hacer scroll hacia arriba suavemente al cambiar de página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        title={tipoPanel === "usuario" ? "Mi Perfil" : "Control"}
        icon={TbCloverFilled}
      >
        {tipoPanel === "usuario" ? (
          <PanelUsuario user={user} />
        ) : (
          <PanelLogs tipo={tipoPanel} user={user} />
        )}
      </BaseDrawer>

      <div className="home-layout-container">
        {/* TOP BAR */}
        <div className="home-top-bar">
          <div
            className="user-profile-info"
            onClick={() => {
              setTipoPanel("usuario");
              setIsPanelOpen(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <TbCloverFilled
              style={{ color: "var(--color-frondoso)", fontSize: "2.8rem" }}
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
              onClick={() => {
                setTipoPanel("actividades");
                setIsPanelOpen(true);
              }}
              className="icon-btn"
            >
              <FaRegBell size={26} color={colores.frondoso} />
            </button>
            <button onClick={logout} className="icon-btn logout-sep">
              <IoLogOutOutline size={32} />
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

        {/* FEEDBACK Y BOTÓN DE REGISTRO */}
        <main className="main-content-layout">
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
                    : `${filtradas.length} coincidencias encontradas`
                }
              />
              {!existeExacta && (
                <BotonPrincipal
                  texto="REGISTRAR PLANTA"
                  onClick={() =>
                    navigate("/registro", { state: { nombre: busqueda } })
                  }
                />
              )}
            </div>
          )}

          {/* PAGINACIÓN SUPERIOR */}
          {busqueda.length < 2 && totalPaginas > 1 && (
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              alCambiarPagina={cambiarPagina}
            />
          )}

          {/* RENDERIZADO DINÁMICO (Card vs Lista Minimalista) */}
          <div
            className={
              filtradas.length > 20 && busqueda.length >= 2
                ? "minimalist-list"
                : "home-grid"
            }
          >
            {plantasParaMostrar.map((p) =>
              filtradas.length > 20 && busqueda.length >= 2 ? (
                <div
                  key={p.id}
                  className="minimalist-item"
                  onClick={() =>
                    navigate(`/detalle/${p.id}`, {
                      state: { fromPage: paginaActual },
                    })
                  }
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
          {/* PAGINACIÓN INFERIOR */}
          {busqueda.length < 2 && totalPaginas > 1 && (
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              alCambiarPagina={cambiarPagina}
            />
          )}
        </main>
      </div>
    </div>
  );
};
