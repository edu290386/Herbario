import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { supabase } from "../supabaseClient";
import { colores } from "../constants/tema";
import { LoginFormView } from "./LoginFormView";

export const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    password: "",
    paisCodigo: "51",
  });

  const handleInputChange = ({ target }) =>
    setForm({ ...form, [target.name]: target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setCargando(true);
  setError(null);
  setExito(false);

  const numeroCompleto = `${form.paisCodigo}${form.telefono}`;

  try {
    // 1. Buscamos al usuario en la base de datos (común para ambos flujos)
    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('telefono', numeroCompleto)
      .single();

    if (!esRegistro) {
      // ==========================================
      // LÓGICA DE LOGIN (ENTRAR)
      // ==========================================
      if (dbError || !usuario) throw new Error("Número no registrado. Contacta al administrador.");
      
      if (usuario.status === 'PENDIENTE') {
        throw new Error("Tu acceso está listo. Por favor, haz clic en 'Activa tu acceso' abajo.");
      }

      if (usuario.password !== form.password) {
        throw new Error("Contraseña incorrecta. Verifica tus datos.");
      }

      // --- TRANSICIÓN FLUIDA ---
      setExito(true);      // Primero encendemos el Éxito ("¡Bienvenido!")
      setCargando(false);   // Inmediatamente apagamos la carga ("Autenticando...")
      
      setTimeout(() => {
        login(usuario); // Redirección tras 1 segundo de mostrar el éxito
      }, 1000);

    } else {
      // ==========================================
      // LÓGICA DE REGISTRO (ACTIVAR)
      // ==========================================
      if (dbError || !usuario) {
        throw new Error("No tienes una invitación activa. Solicítala al administrador.");
      }

      if (usuario.status === 'ACTIVO') {
        throw new Error("Este número ya está activo. Intenta iniciar sesión.");
      }

      // Procedemos a la actualización/activación
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          nombre_completo: form.nombre, 
          email: form.correo, 
          password: form.password,
          status: 'ACTIVO' 
        })
        .eq('telefono', numeroCompleto);

      if (updateError) throw new Error("Error técnico al activar. Inténtalo más tarde.");

      // --- TRANSICIÓN FLUIDA ---
      setExito(true);      // Primero encendemos el Éxito ("¡Registro Exitoso!")
      setCargando(false);   // Luego apagamos la carga ("Guardando...")

      setTimeout(() => {
        setEsRegistro(false);
        setExito(false);
        setForm(prev => ({ ...prev, password: '' })); // Limpiamos clave por seguridad
      }, 1500);
    }

  } catch (err) {
    // Si hay un error, apagamos todo para mostrar el Banner de error
    setError(err.message);
    setCargando(false);
    setExito(false);
    };
  };

  return (
    <div style={styles.container}>
      <h1 style={{ color: colores.bosque, marginBottom: "20px" }}>
        {esRegistro ? "Crear Perfil" : "Acceso a la Plataforma"}
      </h1>
      <LoginFormView
        form={form}
        esRegistro={esRegistro}
        cargando={cargando}
        exito={exito}
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

// Estilos integrados en el mismo archivo para cumplir con tu regla de 2 archivos
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    padding: "20px",
    backgroundColor: "#F3F4F6",
  },
  formCard: {
    width: "100%",
    maxWidth: "340px",
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  row: { display: "flex", gap: "10px" },
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
    minHeight: "58px",
    margin: "5px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    color: "#991B1B",
    padding: "13px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid #FEE2E2",
    width: "100%",
    textAlign: "center",
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
  },
  registroCampos: (visible) => ({
    maxHeight: visible ? "120px" : "0px",
    opacity: visible ? 1 : 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "all 0.4s ease",
  }),
};