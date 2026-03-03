import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { supabase } from "../../../supabaseClient";
import { UserCard } from "./UserCard";
import { ActionCard } from "./ActionCard";
import { StatusBanner } from "../../ui/StatusBanner";
import { cleanNumeric, isValidPhone } from "../../../helpers/textHelper"; // Ajustado a tus helpers
import { formatearFechaLocal } from "../../../helpers/timeHelper";

export const ControlAccesos = () => {
  const [telefonoBusqueda, setTelefonoBusqueda] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);

  const [statusBusqueda, setStatusBusqueda] = useState({
    mostrar: true,
    mensaje: "Busque un teléfono para validar datos o realizar un registro",
    tipo: "info",
  });

  const copiarAlPortapapeles = (texto) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
  };

  const buscarUsuario = async (e, silencioso = false) => {
    if (e && e.preventDefault) e.preventDefault();

    const numLimpio = cleanNumeric(telefonoBusqueda);
    if (!numLimpio) return;

    if (!silencioso) setUsuarioEncontrado(null);

    if (!isValidPhone(numLimpio)) {
      setUsuarioEncontrado(null);
      setStatusBusqueda({
        mostrar: true,
        mensaje: "Número telefónico no válido. Formato incorrecto.",
        tipo: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: usuario, error: errorUser } = await supabase
        .from("usuarios")
        .select("*")
        .eq("telefono", numLimpio)
        .maybeSingle();

      if (errorUser) throw errorUser;

      if (usuario) {
        if (usuario.grupo_id) {
          const { data: grupo } = await supabase
            .from("grupos")
            .select("nombre_grupo")
            .eq("id", usuario.grupo_id)
            .maybeSingle();
          usuario.nombre_grupo_format =
            grupo?.nombre_grupo || "Grupo sin nombre";
        } else {
          usuario.nombre_grupo_format = "USO INDIVIDUAL";
        }
        setUsuarioEncontrado(usuario);
        setStatusBusqueda({ mostrar: false, mensaje: "", tipo: "" });
      } else {
        setUsuarioEncontrado(null);
        setStatusBusqueda({
          mostrar: true,
          mensaje:
            "El número no se encuentra registrado. Puedes registrarlo abajo.",
          tipo: "warning",
        });
      }
    } catch (err) {
      setStatusBusqueda({
        mostrar: true,
        mensaje: `Error: ${err.message}`,
        tipo: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. BUSCADOR */}
      <div style={styles.searchSection}>
        <form onSubmit={buscarUsuario} style={styles.searchWrapper}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="tel"
            placeholder="Código de país + número"
            value={telefonoBusqueda}
            onChange={(e) => setTelefonoBusqueda(cleanNumeric(e.target.value))}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.btnOk} disabled={loading}>
            {loading ? "..." : "OK"}
          </button>
        </form>
      </div>

      {/* 2. BANNERS */}
      {statusBusqueda.mostrar && (
        <div style={{ marginBottom: "1rem" }}>
          <StatusBanner
            message={statusBusqueda.mensaje}
            status={statusBusqueda.tipo}
          />
        </div>
      )}

      {/* 3. VISOR DE DATOS */}
      {(usuarioEncontrado || statusBusqueda.tipo === "warning") && (
        <UserCard
          usuario={
            usuarioEncontrado || {
              nombre: "NUEVO",
              apellido: "REGISTRO",
              rol: "Sin Asignar",
              status: "SUSPENDIDO",
              telefono: telefonoBusqueda, // Eliminamos la dependencia de telefonoRegistro
              nombre_grupo_format: "Sin Asignar",
              suscripcion_vence: null,
            }
          }
          getBadgeStyle={getBadgeStyle}
          getIconStyle={getIconStyle}
          formatearFecha={formatearFechaLocal}
          copiarAlPortapapeles={copiarAlPortapapeles}
        />
      )}

      {/* 4. PANEL DE ACCIÓN */}
      {(usuarioEncontrado || statusBusqueda.tipo === "warning") && (
        <div style={{ opacity: loading ? 0.7 : 1, marginTop: "1rem" }}>
          <ActionCard
            usuario={usuarioEncontrado}
            telefonoBuscado={telefonoBusqueda}
            onRefresh={buscarUsuario}
            // Ya no pasamos onTelefonoChange porque no usaremos el estado duplicado
            resetPadre={() => {
              setUsuarioEncontrado(null);
              setTelefonoBusqueda("");
              setStatusBusqueda({
                mostrar: true,
                mensaje:
                  "Busque un teléfono para validar datos o realizar un registro",
                tipo: "info",
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

const getBadgeStyle = (status) => {
  let bg, color, border;

  switch (status) {
    case "BLOQUEADO":
      bg = "#fee2e2";
      color = "#dc2626";
      border = "#f87171"; // Rojo
      break;
    case "ACTIVO":
      bg = "#dcfce7";
      color = "#15803d";
      border = "#4ade80"; // Verde
      break;
    case "PENDIENTE":
      bg = "#e0f2fe";
      color = "#0369a1";
      border = "#38bdf8"; // Azul
      break;
    case "SUSPENDIDO":
    default:
      bg = "#fef9c3";
      color = "#a16207";
      border = "#facc15"; // Amarillo
      break;
  }

  return {
    backgroundColor: bg,
    color: color,
    border: `1px solid ${border}`,
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "800",
    letterSpacing: "0.5px",
    display: "inline-block",
  };
};

const getIconStyle = (isActive) => ({
  color: isActive ? "#2D5A27" : "#D1D1D1",
  borderColor: isActive ? "#2D5A27" : "#DDD",
  opacity: isActive ? 1 : 0.25,
  fontWeight: isActive ? "bold" : "normal",
});

const styles = {
  container: { padding: "10px", maxWidth: "500px", margin: "0 auto" },
  searchSection: { marginBottom: "1.2rem" },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#FFF",
    borderRadius: "12px",
    padding: "0.5rem 1rem",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  searchIcon: { color: "#2D5A27", marginRight: "0.8rem" },
  searchInput: { border: "none", outline: "none", flex: 1, fontSize: "16px" },
  btnOk: {
    backgroundColor: "#2D5A27",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
