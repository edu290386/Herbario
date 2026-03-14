import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/AuthContext";
import { PlantasContext } from "../../context/PlantasContext";
import {
  normalizarParaBusqueda,
  formatearParaDB,
} from "../../helpers/textHelper";
import { resaltarTexto } from "../../helpers/highLightText";
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
import { PanelAportes } from "../../components/paneles/Aportes/PanelAportes";

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

  // 🟢 ESTADOS INDEPENDIENTES PARA CADA BOTÓN
  const [pendientesAdmin, setPendientesAdmin] = useState(0); // Para el Microscopio (Rojo)
  const [novedadesComunidad, setNovedadesComunidad] = useState(0); // Para la Campana (Verde)
  const [tieneNotificaciones, setTieneNotificaciones] = useState(false); // Punto rojo personal

  useEffect(() => {
    cargarPlantasHome(true);
  }, [cargarPlantasHome]);

  // 🟢 LÓGICA DE CONTEO SEPARADA POR CONSULTAS
  const revisarNotificaciones = useCallback(async () => {
    if (!user) return;

    // 1. Definimos exactamente qué consideramos un "Aporte"
    const accionesAportes = [
      "nuevo_nombre",
      "nueva_imagen",
      "nuevo_comentario",
    ];

    try {
      // --- CONSULTA PARA EL ADMIN (CONTROL DE APORTES) ---
      const { count: countAdmin } = await supabase
        .from("logs")
        .select("*", { count: "exact", head: true })
        .in("tipo_accion", accionesAportes) // 👈 ESTO ES LO QUE FALTABA
        .eq("auditado", "pendiente");

      setPendientesAdmin(countAdmin || 0);

      // --- CONSULTA PARA LA COMUNIDAD (HISTORIAL SEMANAL) ---
      const haceUnaSemana = new Date();
      haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

      const { count: countComunidad } = await supabase
        .from("logs")
        .select("*", { count: "exact", head: true })
        .in("tipo_accion", ["nueva_planta", "nueva_ubicacion"])
        .gt("created_at", haceUnaSemana.toISOString());

      setNovedadesComunidad(countComunidad || 0);

      // --- CONSULTA PARA EL USUARIO ---
      const { count: countUser } = await supabase
        .from("logs")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", user.id)
        .eq("notificacion_vista", false)
        .neq("auditado", "pendiente");
      setTieneNotificaciones((countUser || 0) > 0);
    } catch (error) {
      console.error("Error en sincronización:", error);
    }
  }, [user]);

  // Manejo de carga segura para ESLint
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!ignore) await revisarNotificaciones();
    };
    fetchData();
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => {
      ignore = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [revisarNotificaciones, isPanelOpen]);

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
    aportes: {
      titulo: "Control de Aportes",
      icono: LuMicroscope,
      componente: <PanelAportes user={user} />,
    },
  };

  const configActual = CONFIG_PANELES[tipoPanel] || {};

  return (
    <div className="home-page">
      <BaseDrawer
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={configActual.titulo || "Panel"}
        icon={configActual.icono || TbCloverFilled}
      >
        {configActual.componente}
      </BaseDrawer>

      <div className="home-layout-container">
        {/* TOP BAR */}
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

            {/* 🟢 BOTÓN HISTORIAL: Usa novedadesComunidad (Número Verde) */}
            <button
              onClick={() => abrirPanel("actividades")}
              className="icon-btn action-badge-container"
            >
              <FaRegBell size={20} color={colores.frondoso} />
              {novedadesComunidad > 0 && (
                <span className="badge-numero-comunidad">
                  {novedadesComunidad}
                </span>
              )}
              {tieneNotificaciones && <span className="badge-punto"></span>}
            </button>

            {/* 🟢 BOTÓN APORTES: Usa pendientesAdmin (Número Rojo) */}
            <button
              onClick={() => abrirPanel("aportes")}
              className="icon-btn action-badge-container"
            >
              <LuMicroscope size={22} color={colores.frondoso} />
              {(user?.rol === "Administrador" || user?.rol === "Colaborador") &&
                pendientesAdmin > 0 && (
                  <span className="badge-numero">
                    {pendientesAdmin > 99 ? "+99" : pendientesAdmin}
                  </span>
                )}
            </button>

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

          {busqueda.length < 2 && totalPaginas > 1 && (
            <div className="pagination-wrapper">
              <Paginador
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                alCambiarPagina={cambiarPagina}
              />
            </div>
          )}

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
