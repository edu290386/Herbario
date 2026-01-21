import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Leaf, Search, PlusCircle, MapPin } from "lucide-react";
import { BotonRegistrar } from "../components/BotonRegistrar";
import { colores } from "../constants/tema";
import { CardPlanta } from "../components/CardPlanta";
import { normalizarParaBusqueda } from "../helpers/textHelper";

export const HomePage = () => {
  const [plantas, setPlantas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // 1. Usamos 'function' para que JavaScript la reconozca en todo el archivo (Hoisting)
  async function obtenerPlantas() {
    try {
      const { data, error } = await supabase.from("plantas").select("*");

      if (error) throw error;
      setPlantas(data || []);
    } catch (error) {
      console.error("Error al obtener plantas:", error.message);
    }
  }

  // 2. El useEffect llama a la función de forma segura al montar el componente
  useEffect(() => {
    obtenerPlantas();
  }, []);

  // 3. Lógica de filtrado para la búsqueda
  const plantasFiltradas = plantas.filter(
    (p) =>
      busqueda === "" ||
      p.busqueda_index.includes(normalizarParaBusqueda(busqueda)),
  );
  // 4. CONTROL DE ADMIN: ¿Existe ya este nombre exacto?
  const existeCoincidenciaExacta = plantas.some(
    (p) => p.nombre_comun.toLowerCase() === busqueda.trim().toLowerCase(),
  );

  return (
    <div style={estilos.pagina}>
      <header style={estilos.header}>
        <div style={estilos.logoSeccion}>
          <Leaf color={colores.frondoso} size={32} fill={colores.fondo} />
          <h1 style={estilos.titulo}>Herbario</h1>
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
              <mark style={estilos.resaltado}>"{busqueda.toUpperCase()}"</mark>?
              Regístrala tú mismo.
            </p>
            <div style={estilos.wrapperBotonRegistro}>
              <BotonRegistrar
                texto={`REGISTRAR NUEVA PLANTA`}
                onClick={() =>
                  navigate("/registro", {
                    state: {
                      nombreComun: busqueda.trim(),
                      vieneDeDetalle: false,
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
};;

const estilos = {
  pagina: {
    backgroundColor: colores.fondo,
    minHeight: "100vh",
    padding: "0px",
    fontFamily: '"Segoe UI", sans-serif',
  },

  header: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "25px 20px 40px 20px", // Añadimos padding para que no choque con la muesca del móvil
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
    color: colores.bosque,
    fontSize: "2.2rem",
    fontWeight: "800",
    margin: 0,
  },

  buscadorWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    maxWidth: "600px",
    margin: "0 auto",
  },

  iconoBusqueda: { position: "absolute", left: "15px" },

  input: {
    width: "100%",
    padding: "15px 15px 15px 50px",
    borderRadius: "25px",
    border: `2px solid ${colores.hoja}`,
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

  // GRILLA CORREGIDA: Multi-columna en escritorio, 1 columna en móvil
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
};
