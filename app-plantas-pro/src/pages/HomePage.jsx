import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Leaf, Search, PlusCircle, MapPin } from "lucide-react";
import { BotonRegistrar } from "../components/BotonRegistrar";
import { colores } from "../constants/tema";
import { CardPlanta } from "../components/CardPlanta";

export const HomePage = () => {
  const [plantas, setPlantas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    obtenerPlantas();
  }, []);

  const obtenerPlantas = async () => {
    const { data } = await supabase.from("plantas").select("*");
    setPlantas(data || []);
    console.log(data);
  };

  const plantasFiltradas = plantas.filter((p) =>
    p.nombre_comun.toLowerCase().includes(busqueda.toLowerCase())
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
            style={estilos.input}
            placeholder="Buscar planta ..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      <main style={estilos.layoutPrincipal}>
        {plantasFiltradas.length > 0 ? (
          <div style={estilos.grilla}>
            {plantasFiltradas.map((p) => (
              <CardPlanta key={p.id} planta={p} />
            ))}
          </div>
        ) : (
          busqueda.length > 2 &&
          plantasFiltradas.length === 0 && (
            <div style={estilos.contenedorNuevo}>
              <p>
                La planta "<strong>{busqueda}</strong>" no se encuentra en la galeria.
              </p>
              <BotonRegistrar
                texto={`Registrar planta`}
                // Pasamos solo el nombre porque es una planta NUEVA
                onClick={() =>
                  navigate("/registro", {
                    state: { nombreComun: busqueda },
                  })
                }
              />
            </div>
          )
        )}
      </main>
    </div>
  );
};

const estilos = {
  pagina: {
    backgroundColor: colores.fondo,
    minHeight: "100vh",
    padding: "0px",
    fontFamily: '"Segoe UI", sans-serif',
  },
  header: { maxWidth: "800px", margin: "0 auto 40px", textAlign: "center" },
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
    padding: "20px",
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

};
