import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colores } from "../constants/tema";
import { CardPlanta } from "../components/planta/CardPlanta";
import { formatearParaDB, normalizarParaBusqueda } from "../helpers/textHelper";
import { AuthContext } from "../context/AuthContext";
import { PlantasContext } from "../context/PlantasContext";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";

import { IoLogOutOutline, IoSearchOutline } from "react-icons/io5";
import { TbCloverFilled } from "react-icons/tb";
import { GoAlert, GoCheckCircleFill } from "react-icons/go";

export const HomePage = () => {

  const {user, logout} = useContext(AuthContext);
  const {plantas, cargando, cargarPlantasHome} = useContext(PlantasContext)
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

   // 1. El useEffect llama a la función de forma segura al montar el componente
  useEffect(() => {
    cargarPlantasHome()
  }, [cargarPlantasHome]);

  // 2. Lógica de filtrado para la búsqueda
  const plantasFiltradas = plantas.filter(
    (p) =>
      busqueda === "" ||
      p.busqueda_index.includes(normalizarParaBusqueda(busqueda)),
  );
  // 3. CONTROL DE ADMIN: ¿Existe ya este nombre exacto?
  const existeCoincidenciaExacta = plantas.some(
    (p) => p.nombre_comun.toLowerCase() === busqueda.trim().toLowerCase(),
  );

  return (
    <div style={estilos.pagina}>
      <div style={estilos.headerCompacto}>
        <div style={estilos.userBarContainer}>
          <div style={estilos.avatarEstiloNano}>
            {user?.nombre_completo?.charAt(0).toUpperCase()}
          </div>
          <div style={estilos.contenedorNombres}>
            <span style={estilos.textoNombre}>
              {user?.nombre_completo?.split(" ")[0]}
            </span>
            <span style={estilos.textoRol}>
              {user?.grupos.nombre_grupo}{" "}
              <span style={{ color: colores.frondoso }}>
                <TbCloverFilled style={estilos.spinner} />
              </span>
            </span>
          </div>
        </div>
        {/* Derecha: Botón Salir */}
        <button onClick={logout} style={estilos.logoutSimple}>
          <IoLogOutOutline size={35} />
        </button>
      </div>
      <header style={estilos.header}>
        <div style={estilos.buscadorWrapper}>
          <IoSearchOutline
            style={estilos.iconoBusqueda}
            color={colores.hoja}
            size={24}
          />
          <input
            type="text"
            style={estilos.input}
            placeholder="Buscar planta ..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      <main style={estilos.layoutPrincipal}>
        {/* SECCIÓN DINÁMICA: Feedback y Registro */}
        {busqueda.length > 0 && (
          <div style={estilos.contenedorMensaje}>
            {/* BANNER UNIFICADO: Cambia de color y contenido sin moverse */}
            <div
              style={{
                ...estilos.mensajeCheck,
                backgroundColor:
                  plantasFiltradas.length > 0 ? colores.claro : "#FFF9C4", // Verde suave : Crema
                borderColor:
                  plantasFiltradas.length > 0
                    ? `${colores.frondoso}44`
                    : "#856404",
              }}
            >
              {plantasFiltradas.length > 0 ? (
                <>
                  <GoCheckCircleFill size={22} color={colores.frondoso} />
                  <span style={estilos.textoCoincidencias}>
                    {plantasFiltradas.length}{" "}
                    {plantasFiltradas.length === 1
                      ? "coincidencia encontrada"
                      : "coincidencias encontradas"}
                  </span>
                </>
              ) : (
                <>
                  <GoAlert size={22} color="#856404" />
                  <span
                    style={{ ...estilos.textoCoincidencias, color: "#856404" }}
                  >
                    0 coincidencias encontradas
                  </span>
                </>
              )}
            </div>

            {/* BOTÓN DE REGISTRO: Aparece debajo del banner si no hay coincidencia exacta */}
            {!existeCoincidenciaExacta && (
              <div style={estilos.wrapperBotonRegistro}>
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

            {/* Separador visual opcional */}
            {plantasFiltradas.length > 0 && <div style={estilos.divisor} />}
          </div>
        )}

        {/* SECCIÓN DE SUGERENCIAS */}
        {plantasFiltradas.length > 0 && (
          <div style={estilos.grilla}>
            {plantasFiltradas.map((p) => (
              <CardPlanta key={p.id} planta={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const estilos = {
  pagina: {
    position: "relative",
    backgroundColor: colores.fondo,
    minHeight: "100vh",
    width: "100%",
    paddingTop: "5px",
    fontFamily: '"Segoe UI", sans-serif',
    // Agregamos esto para que en horizontal el contenido no choque con los bordes
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
  },
  headerCompacto: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "20px",
    boxSizing: "border-box",
  },
  header: {
    width: "90%",
    maxWidth: "800px",
    margin: "0 auto",
    paddingBottom: "40px", // Añadimos padding para que no choque con la muesca del móvil
    textAlign: "center",
  },
  buscadorWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    maxWidth: "600px",
    margin: "0 auto",
  },
  iconoBusqueda: {
    position: "absolute",
    left: "15px",
  },
  input: {
    width: "100%",
    padding: "15px 15px 15px 50px",
    borderRadius: "15px",
    border: `2px solid ${colores.frondoso}80`,
    outline: "none",
    fontSize: "1rem",
  },
  layoutPrincipal: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Centra el buscador y la grilla
    padding: "0 20px 20px",
    boxSizing: "border-box",
  },
  grilla: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
    maxWidth: "1500px",
    width: "100%",
    justifyContent: "center",
    justifyItems: "center", // Centra los cards cuando hay solo uno
    boxSizing: "border-box",
  },
  wrapperBotonRegistro: {
    width: "100%",
    maxWidth: "350px",
    margin: "0 auto",
  },
  userBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  avatarEstiloNano: {
    width: "65px", // Tamaño generoso como en la foto
    height: "65px",
    backgroundColor: colores.frondoso, // El verde exacto de la imagen
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.8rem", // Letra grande y clara
    fontWeight: "bold",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // Sombra sutil
  },
  contenedorNombres: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  textoNombre: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: colores.bosque, // Tu color bosque
    lineHeight: "1.1",
  },
  textoRol: {
    fontSize: "1rem",
    color: "#888",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  logoutSimple: {
    background: "none",
    border: "none",
    color: "#A0A0A0",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    marginRight: "-5px",
  },
  spinner: {
    fontSize: "1rem",
    color: colores.frondoso,
  },
  contenedorMensaje: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width:"100%",
    maxWidth:"600px",
  },
  mensajeCheck: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    borderRadius: "12px",
    border: `1px solid ${colores.frondoso}44`,
  },
  textoCoincidencias: {
    color: colores.bosque,
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  resaltado: {
    backgroundColor: "#fff59d", // Amarillo suave para resaltar la búsqueda
    padding: "2px 5px",
    borderRadius: "4px",
    fontWeight: "bold",
    color: "#333",
  },
  divisor: {
    height: "1px",
    backgroundColor: "#eee",
    margin: "10px 0",
    width: "100%",
  },
};
