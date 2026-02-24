import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { colores } from "../constants/tema";
import { LoginFormView } from "./LoginFormView";
import {
  getUsuarioPorTelefono,
  activarUsuario,
} from "../services/usuariosServices";
import { obtenerIdentidad } from "../helpers/identidadHelper";
import { PlantasContext } from "./PlantasContext";
import { Spinner } from "../components/ui/Spinner";
import { Footer } from "../components/ui/Footer";
import { TbCloverFilled } from "react-icons/tb";

export const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const { cargarPlantasHome } = useContext(PlantasContext);
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = ({ target }) =>
    setForm({ ...form, [target.name]: target.value });

  // 🛠️ Función para detectar el tipo de dispositivo
  const detectarDispositivo = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? "id_movil"
      : "id_laptop";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Limpieza total del número (solo dígitos para evitar líos con Safari)
      const numeroLimpio = form.telefono.replace(/\D/g, "");
      if (numeroLimpio.length < 8)
        throw new Error("Número de teléfono no válido.");

      const { data: usuario, error: dbError } =
        await getUsuarioPorTelefono(numeroLimpio);
      if (dbError || !usuario)
        throw new Error("Número no registrado. Contacta al administrador.");

      const columnaID = detectarDispositivo();
      const currentFingerprint = navigator.userAgent + navigator.language; // Fingerprint básica

      if (!esRegistro) {
        // --- VALIDACIÓN DE DISPOSITIVO (SEGURIDAD) ---
        if (usuario[columnaID] && usuario[columnaID] !== currentFingerprint) {
          throw new Error(
            `Este usuario ya está vinculado a otro ${columnaID === "id_movil" ? "Celular" : "Laptop"}.`,
          );
        }

        if (usuario.password !== form.password)
          throw new Error("Contraseña incorrecta.");

        // Si la ranura está vacía, la llenamos (auto-registro de dispositivo)
        if (!usuario[columnaID]) {
          // Aquí llamarías a una función para actualizar el id_movil o id_laptop en Supabase
        }

        setCargando(true);
        cargarPlantasHome();
        setTimeout(() => login(usuario), 3000);
      } else {
        // --- REGISTRO / ACTIVACIÓN ---
        if (usuario.status === "ACTIVO")
          throw new Error("Este número ya está activo.");

        setCargando(true);
        const nuevoAlias = obtenerIdentidad({
          ...form,
          telefono: numeroLimpio,
        });

        const datosActivacion = {
          ...form,
          alias: nuevoAlias,
          [columnaID]: currentFingerprint, // Registramos su primer dispositivo
          status: "ACTIVO",
        };

        await activarUsuario(numeroLimpio, datosActivacion);
        setEsRegistro(false);
        setCargando(false);
        alert("¡Cuenta activada con éxito!");
      }
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  if (cargando && !esRegistro) return <Spinner />;

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .logo-giratorio { animation: spin-slow 10s linear infinite; }
      `}</style>

      <div style={styles.mainContent}>
        <div style={styles.brandContainer}>
          <div style={styles.logoTextWrapper}>
            <TbCloverFilled
              size={45}
              color={colores.frondoso}
              className="logo-giratorio"
            />
            <h1 style={styles.mainTitle}>Herbario Digital</h1>
          </div>
          <div style={styles.fullSeparator} />
        </div>

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
      <Footer />
    </div>
  );
};

const styles = {
  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#F4F7F5",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  brandContainer: { display: "inline-block", marginBottom: "40px" },
  logoTextWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "10px",
  },
  mainTitle: {
    color: colores.bosque,
    fontSize: "2.5rem",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-1px",
  },
  fullSeparator: {
    width: "100%",
    height: "4px",
    backgroundColor: colores.frondoso,
    borderRadius: "2px",
  },
  formCard: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
  },
  formElement: { display: "flex", flexDirection: "column", gap: "20px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.9rem", fontWeight: "700", color: "#4A5568" },
  input: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "1.5px solid #E2E8F0",
    fontSize: "16px",
  },
  inputRelative: { position: "relative" },
  botonOjo: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#A0AEC0",
    cursor: "pointer",
  },
  errorBanner: {
    backgroundColor: "#FFF5F5",
    color: "#C53030",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "1px solid #FED7D7",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  linkButton: {
    marginTop: "25px",
    background: "none",
    border: "none",
    color: colores.bosque,
    fontWeight: "700",
    cursor: "pointer",
    textDecoration: "underline",
    width: "100%",
  },
  registroCampos: (visible) => ({
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    maxHeight: visible ? "600px" : "0",
    opacity: visible ? 1 : 0,
    overflow: "hidden",
    transition: "all 0.4s",
  }),
};
