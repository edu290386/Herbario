import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardPlanta } from "../components/planta/CardPlanta";
import { formatearParaDB, normalizarParaBusqueda } from "../helpers/textHelper";
import { AuthContext } from "../context/AuthContext";
import { PlantasContext } from "../context/PlantasContext";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { StatusBanner } from "../components/ui/StatusBanner";
import { IoLogOutOutline, IoSearchOutline } from "react-icons/io5";
import { TbCloverFilled } from "react-icons/tb";
import { obtenerIdentidad } from "../helpers/identidadHelper";

export const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { plantas, cargarPlantasHome } = useContext(PlantasContext);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // 1. El useEffect llama a la función de forma segura al montar el componente
  useEffect(() => {
    cargarPlantasHome();
  }, [cargarPlantasHome]);

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
      {/* EL CONTENEDOR MAESTRO QUE RIGE LOS MÁRGENES DE 15PX */}
      <div className="home-layout-container">
        {/* TOP BAR: Crece hasta 4 cards */}
        <div className="home-top-bar">
          <div className="user-profile-info">
            <TbCloverFilled
              style={{ color: "var(--color-frondoso)", fontSize: "3rem" }}
            />
            <div className="user-text-details">
              <span className="user-name-text">{obtenerIdentidad(user)}</span>
              <span className="user-role-text">
                {user?.grupos?.nombre_grupo}
              </span>
            </div>
          </div>

          <button onClick={logout} className="logout-btn-simple">
            <IoLogOutOutline size={40} />
          </button>
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
                <CardPlanta key={p.id} planta={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};