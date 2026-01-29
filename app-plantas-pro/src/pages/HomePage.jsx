import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { colores } from "../constants/tema";
import { CardPlanta } from "../components/planta/CardPlanta";
import { normalizarParaBusqueda } from "../helpers/textHelper";
import { AuthContext } from "../context/AuthContext";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { MdGroups } from "react-icons/md";
import { ImExit, ImUserCheck } from "react-icons/im";
import { getPlantasBasico } from "../services/plantasServices";
import { FaNetworkWired } from "react-icons/fa";

export const HomePage = () => {

  const {user, logout} = useContext(AuthContext);
  const [plantas, setPlantas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

console.log(user)
   // 1. El useEffect llama a la función de forma segura al montar el componente
  useEffect(() => {
    const obtenerPlantas = async () => {
      try {
        // Opcional: podrías poner un setLoading(true) aquí
        const data = await getPlantasBasico();
        setPlantas(data || []);
      } catch (error) {
        console.error("Error al obtener plantas:", error.message);
        // Aquí podrías mostrar una notificación de error al usuario
      } finally {
        // setLoading(false);
      }
    };

    obtenerPlantas();
  }, []);
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
      <div style={estilos.userBarContainer}>
        {/* Izquierda: Info del User */}
        <div style={estilos.infoIzquierda}>
          <div style={estilos.userName}>
            <ImUserCheck size={18} color={colores.frondoso} />
            <span>{user?.nombre_completo.split(" ")[0]}</span>
          </div>
          <div style={estilos.userName}>
            <MdGroups size={18} color={colores.frondoso} />
            <span>{user?.grupos.nombre_grupo}</span>
          </div>
          <div style={estilos.userName}>
            <FaNetworkWired size={18} color={colores.frondoso} />
            <span>{user?.rol}</span>
          </div>
        </div>

        {/* Derecha: Botón Salir */}
        <button onClick={logout} style={estilos.logoutSimple}>
          <ImExit size={30} color={colores.frondoso} />
          <span style={estilos.textoSalir}></span>
        </button>
      </div>
      <header style={estilos.header}>
        <div style={estilos.logoSeccion}>
          <h1 style={estilos.titulo}>GALERIA</h1>
        </div>

        <div style={estilos.buscadorWrapper}>
          <Search
            style={estilos.iconoBusqueda}
            color={colores.hoja}
            size={20}
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
        {/* 1. SECCIÓN DE REGISTRO: Aparece si el usuario escribe algo que no existe IDÉNTICO */}
        {busqueda.length > 0 && !existeCoincidenciaExacta && (
          <div style={estilos.contenedorNuevo}>
            <p style={estilos.textoAviso}>
              ¿No encuentras{" "}
              <mark style={estilos.resaltado}>{busqueda.toUpperCase()}</mark>?
              Regístrala primero.
            </p>
            <div style={estilos.wrapperBotonRegistro}>
              <BotonPrincipal
                texto={`REGISTRAR NUEVA PLANTA`}
                onClick={() =>
                  navigate("/registro", {
                    state: {
                      nombreComun: busqueda.trim(),
                      usuarioId: user.id,
                    },
                  })
                }
              />
            </div>
            {/* Separador visual si hay sugerencias debajo */}
            {plantasFiltradas.length > 0 && <div style={estilos.divisor} />}
          </div>
        )}

        {/* 2. SECCIÓN DE SUGERENCIAS: Muestra todo lo que coincida (Higuerilla, Higuereta, etc.) */}
        {plantasFiltradas.length > 0 ? (
          <div style={estilos.grilla}>
            {plantasFiltradas.map((p) => (
              <CardPlanta key={p.id} planta={p} />
            ))}
          </div>
        ) : (
          // Mensaje cuando no hay absolutamente nada
          busqueda.length > 0 &&
          existeCoincidenciaExacta === false && (
            <p style={estilos.mensajeVacio}>
              Toca el botón de arriba para ser el primero en registrarla.
            </p>
          )
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
  header: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "85px 20px 40px 20px", // Añadimos padding para que no choque con la muesca del móvil
    textAlign: "center",
  },
  logoSeccion: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  titulo: {
    color: colores.frondoso,
    fontSize: "2.2rem",
    fontWeight: "700",
    margin: 0,
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
    borderRadius: "25px",
    border: `2px solid ${colores.frondoso}`,
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
  contenedorNuevo: {
    padding: "0px",
    marginTop: "0px",
    backgroundColor: colores.fondo, // Un verde muy suave para resaltar
    borderRadius: "20px",
    marginBottom: "40px", // ⬅️ ESPACIO CLAVE: Separa el banner de la grilla
    textAlign: "center",
    width: "100%",
    maxWidth: "600px", // Para que no se vea gigante en PC
  },
  textoAviso: {
    color: colores.bosque,
    fontSize: "1rem",
    fontWeight: "500",
  },
  wrapperBotonRegistro: {
    width: "100%",
    maxWidth: "350px",
    margin: "0 auto",
  },
  userBarContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "0 15px",
    width: "100%",
    boxSizing: "border-box",
    position: "absolute", // Lo sacamos del flujo para que no empuje el header hacia abajo
    top: "10px",
    left: 0,
    zIndex: 10,
  },
  infoIzquierda: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  userName: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: colores.bosque,
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  logoutSimple: {
    display: "flex",
    flexDirection: "column", // Icono arriba, texto abajo (ahorra ancho)
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
  },
};
