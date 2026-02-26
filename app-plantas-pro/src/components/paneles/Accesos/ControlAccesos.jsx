import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { supabase } from "../../../supabaseClient";
import { UserCard } from "./UserCard";
import { ActionCard } from "./ActionCard";
import { StatusBanner } from "../../ui/StatusBanner";
import { cleanNumeric } from "../../../helpers/textHelper";
import { formatearFechaLocal } from "../../../helpers/timeHelper";
import { isValidPhone } from "../../../helpers/textHelper";

export const ControlAccesos = () => {
  const [telefonoBusqueda, setTelefonoBusqueda] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [telefonoRegistro, setTelefonoRegistro] = useState("");

  const [statusBusqueda, setStatusBusqueda] = useState({
    mostrar: true,
    mensaje: "Busque un teléfono para validar datos o realizar un registro",
    tipo: "info",
  });

  const copiarAlPortapapeles = (texto) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
  };

  const buscarUsuario = async (e) => {
    if (e) e.preventDefault();

    // 1. Validar que no esté vacío
    if (!telefonoBusqueda) return;
    // 2. Validación de seguridad (Longitud y Formato)
    if (!isValidPhone(telefonoBusqueda)) {
      setUsuarioEncontrado(null); // Limpiamos cualquier resultado previo
      setStatusBusqueda({
        mostrar: true,
        mensaje:
          "Número telefónico no válido. Comunicarse con el administrador.",
        tipo: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: usuario, error: errorUser } = await supabase
        .from("usuarios")
        .select("*")
        .eq("telefono", telefonoBusqueda.trim())
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

      {/* 3. VISOR DE DATOS (UserCard) */}
      {(usuarioEncontrado || statusBusqueda.tipo === "warning") && (
        <UserCard
          usuario={
            usuarioEncontrado || {
              nombre: "NUEVO",
              apellido: "REGISTRO",
              rol: "Sin Asignar",
              status: "PENDIENTE",
              telefono: telefonoRegistro || telefonoBusqueda,
              nombre_grupo_format: "Sin Asignar",
              suscripcion_vence: null,
            }
          }
          getBadgeStyle={getBadgeStyle} // CRÍTICO: Se pasa la función
          getIconStyle={getIconStyle} // CRÍTICO: Se pasa la función
          formatearFecha={formatearFechaLocal}
          copiarAlPortapapeles={copiarAlPortapapeles}
        />
      )}

      {/* 4. PANEL DE ACCIÓN */}
      {(usuarioEncontrado || statusBusqueda.tipo === "warning") && (
        <div
          style={{
            opacity: loading ? 0.7 : 1,
            pointerEvents: loading ? "none" : "auto",
            marginTop: "1rem",
          }}
        >
          <ActionCard
            usuario={usuarioEncontrado}
            telefonoBuscado={telefonoBusqueda}
            onRefresh={buscarUsuario}
            onTelefonoChange={setTelefonoRegistro}
            resetPadre={() => {
              setUsuarioEncontrado(null);
              setTelefonoBusqueda("");
              setTelefonoRegistro("");
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

const getBadgeStyle = (status, dias) => {
  const base = { padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" };
  if (status === "SUSPENDIDO" || dias <= 0) return { ...base, backgroundColor: "#FDECEA", color: "#C62828", border: "1px solid #C62828" };
  if (status === "PENDIENTE") return { ...base, backgroundColor: "#FFF8E1", color: "#F57F17", border: "1px solid #F57F17" };
  return { ...base, backgroundColor: "#F0F4F1", color: "#2D5A27", border: "1px solid #2D5A27" };
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
  searchWrapper: { display: "flex", alignItems: "center", background: "#FFF", borderRadius: "12px", padding: "0.5rem 1rem", border: "1px solid rgba(0,0,0,0.1)" },
  searchIcon: { color: "#2D5A27", marginRight: "0.8rem" },
  searchInput: { border: "none", outline: "none", flex: 1, fontSize: "16px" },
  btnOk: { backgroundColor: "#2D5A27", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
};
