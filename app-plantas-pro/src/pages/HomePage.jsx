import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PlantasContext } from "../context/PlantasContext";
import { normalizarParaBusqueda, formatearParaDB } from "../helpers/textHelper";
import { colores } from "../constants/tema";
// Iconos y UI
import { IoLogOutOutline, IoSearchOutline } from "react-icons/io5";
import { TbCloverFilled } from "react-icons/tb";
import { FaRegBell } from "react-icons/fa";
import { LuMicroscope } from "react-icons/lu";
// Componentes Refactorizados
import { BaseDrawer } from "../components/paneles/BaseDrawer";
import { PanelLogs } from "../components/paneles/PanelLogs";
import { PanelUsuario } from "../components/paneles/PanelUsuario";
import { CardPlanta } from "../components/planta/CardPlanta";
import { StatusBanner } from "../components/ui/StatusBanner";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";

export const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { plantas, cargarPlantasHome } = useContext(PlantasContext);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // ESTADOS DEL PANEL
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [tipoPanel, setTipoPanel] = useState(null);

  useEffect(() => {
    cargarPlantasHome();
  }, [cargarPlantasHome]);

  const abrirPanel = (tipo) => {
    setTipoPanel(tipo);
    setIsPanelOpen(true);
  };

  // Lógica de filtrado
  const busquedaNorm = busqueda ? normalizarParaBusqueda(busqueda) : "";
  const plantasFiltradas = plantas.filter((p) => {
    if (busqueda === "") return true;
    return p.nombres_planta?.some((n) =>
      normalizarParaBusqueda(n).includes(busquedaNorm),
    );
  });

  const existeCoincidenciaExacta = plantas.some((p) =>
    p.nombres_planta?.some((n) => normalizarParaBusqueda(n) === busquedaNorm),
  );

  return (
    <div className="home-page">
      <BaseDrawer
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={
          tipoPanel === "usuario"
            ? "Mi Perfil"
            : tipoPanel === "actividades"
              ? "Historial"
              : "Control"
        }
        icon={
          tipoPanel === "usuario"
            ? TbCloverFilled
            : tipoPanel === "actividades"
              ? FaRegBell
              : LuMicroscope
        }
      >
        {tipoPanel === "usuario" ? (
          <PanelUsuario user={user} />
        ) : (
          <PanelLogs tipo={tipoPanel} user={user} />
        )}
      </BaseDrawer>

      <div className="home-layout-container">
        <div className="home-top-bar">
          <div
            className="user-profile-info"
            onClick={() => abrirPanel("usuario")}
            style={{ cursor: "pointer" }}
          >
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
              onClick={() => abrirPanel("actividades")}
              className="icon-btn"
            >
              <FaRegBell size={30} color={colores.frondoso} />
            </button>
            {(user?.rol === "Administrador" || user?.rol === "Colaborador") && (
              <button
                onClick={() => abrirPanel("gestion")}
                className="icon-btn"
              >
                <LuMicroscope size={32} color={colores.frondoso} />
              </button>
            )}
            <button onClick={logout} className="icon-btn logout-sep">
              <IoLogOutOutline size={40} />
            </button>
          </div>
        </div>

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
          {busqueda.length > 0 && (
            <div className="search-feedback-container">
              <StatusBanner
                status={plantasFiltradas.length > 0 ? "success" : "warning"}
                message={`${plantasFiltradas.length} coincidencias`}
              />
              {!existeCoincidenciaExacta && (
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
              )}
            </div>
          )}

          <div className="home-grid">
            {plantasFiltradas.map((p) => (
              <CardPlanta key={p.id} planta={p} busqueda={busqueda} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
