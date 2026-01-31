import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { colores } from "../constants/tema";
import { LoginFormView } from "./LoginFormView";
import {
  getUsuarioPorTelefono,
  activarUsuario,
} from "../services/usuariosServices";
import { TbCloverFilled } from "react-icons/tb";

export const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // 🚩 Formulario expandido con campos atómicos
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    alias: "",
    correo: "",
    telefono: "",
    password: "",
    confirmPassword: "", // Para validar el match
    paisCodigo: "51",
  });

  const handleInputChange = ({ target }) =>
    setForm({ ...form, [target.name]: target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // --- 1. VALIDACIONES PREVENTIVAS DE REGISTRO ---
      if (esRegistro) {
        if (!form.nombre.trim() || !form.apellido.trim()) {
          throw new Error("Nombre y Apellido son obligatorios.");
        }
        if (form.password !== form.confirmPassword) {
          throw new Error("Las contraseñas no coinciden. Verifícalas.");
        }
        if (form.password.length < 5) {
          throw new Error("La contraseña debe tener al menos 5 caracteres.");
        }
      }

      const numeroCompleto = `${form.paisCodigo}${form.telefono}`
        .replace(/\s+/g, "")
        .trim();

      // --- 2. LÓGICA DE BASE DE DATOS ---
      const { data: usuario, error: dbError } =
        await getUsuarioPorTelefono(numeroCompleto);

      if (!esRegistro) {
        // --- FLUJO LOGIN ---
        if (dbError || !usuario)
          throw new Error("Número no registrado. Contacta al administrador.");

        if (usuario.status === "PENDIENTE") {
          throw new Error(
            "Tu acceso está listo. Haz clic en 'Activa tu acceso' abajo.",
          );
        }

        if (usuario.password !== form.password) {
          throw new Error("Contraseña incorrecta.");
        }

        setCargando(true);
        setTimeout(() => {
          login(usuario);
        }, 2000);
      } else {
        // --- FLUJO REGISTRO (ACTIVACIÓN) ---
        if (dbError || !usuario) {
          throw new Error(
            "No tienes una invitación activa. Solicítala al administrador.",
          );
        }
        if (usuario.status === "ACTIVO") {
          throw new Error("Este número ya está activo. Inicia sesión.");
        }

        setCargando(true);

        // Limpiamos espacios antes de guardar
        const datosParaEnviar = {
          ...form,
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          alias: form.alias.trim(),
        };

        const { error: updateError } = await activarUsuario(
          numeroCompleto,
          datosParaEnviar,
        );

        if (updateError) throw new Error("Error técnico al activar.");

        setTimeout(() => {
          setEsRegistro(false);
          setCargando(false);
          setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
          alert("¡Cuenta activada con éxito! Ahora puedes entrar.");
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  if (cargando && !esRegistro) {
    return (
      <div style={styles.loadingContainer}>
        <TbCloverFilled style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1
        style={{
          color: colores.bosque,
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        {esRegistro ? "Crear Perfil" : "Acceso a la Plataforma"}
      </h1>
      <LoginFormView
        form={form}
        esRegistro={esRegistro}
        cargando={cargando}
        error={error}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        styles={styles}
        onToggleMode={() => {
          setEsRegistro(!esRegistro);
          setError(null);
        }}
      />
    </div>
  );
};

// --- ESTILOS AJUSTADOS PARA EL NUEVO FORMULARIO ---
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: "#F3F4F6",
  },
  formCard: {
    width: "100%",
    maxWidth: "360px",
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  row: { display: "flex", gap: "10px", width: "100%" },
  input: {
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    backgroundColor: "white",
  },
  errorContainer: {
    minHeight: "40px",
    margin: "5px 0",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    color: "#991B1B",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid #FEE2E2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  linkButton: {
    marginTop: "20px",
    background: "none",
    border: "none",
    color: colores.bosque,
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
    width: "100%",
  },
  registroCampos: (visible) => ({
    maxHeight: visible ? "350px" : "0px",
    opacity: visible ? 1 : 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "all 0.5s ease",
  }),
  botonOjo: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    padding: "8px",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: colores.fondo,
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  spinner: {
    fontSize: "8rem",
    animation: "spin 2s linear infinite",
    color: colores.frondoso,
  },
};
