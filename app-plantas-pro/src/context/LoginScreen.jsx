import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { PlantasContext } from "../context/PlantasContext";
import {
  getUsuarioPorTelefono,
  iniciarSesionSegura,
  activarUsuario,
} from "../services/usuariosServices"; // Ajusta tus rutas
import { cleanNumeric, isValidPhone } from "../helpers/phoneHelper";
import {
  getCleanHardwareName,
  detectarTipoCampo,
} from "../helpers/hardwareHelper";
import { Spinner } from "../components/ui/Spinner"; // O tu componente de carga
import { LoginFormView } from "./LoginFormView";
import fondoOzain from "../assets/fondoLogin.jpg";

export const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const { cargarPlantasHome } = useContext(PlantasContext);

  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [banner, setBanner] = useState({ tipo: "", msj: "" });

  const [form, setForm] = useState({
    telefono: "",
    password: "",
    confirmPassword: "",
    primerNombre: "",
    primerApellido: "",
  });

  const handleInputChange = ({ target }) =>
    setForm({ ...form, [target.name]: target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner({ tipo: "", msj: "" });

    // 1. Limpieza y Validación de Teléfono (Helper)
    const numeroLimpio = cleanNumeric(form.telefono);
    if (!isValidPhone(numeroLimpio)) {
      setBanner({ tipo: "error", msj: "Número inválido (9-15 dígitos)." });
      return;
    }

    // 2. Detección de Hardware (Helper)
    const columnaID = detectarTipoCampo(); // id_movil o id_laptop
    const nombreEquipo = getCleanHardwareName(); // "Laptop Windows", etc.
   
alert(
  `INFO DETECTADA:\n` +
    `- Columna: ${columnaID}\n` +
    `- Nombre: ${nombreEquipo}\n\n` +
    `INFO CRUDA (UserAgent):\n${navigator.userAgent}`,
);

    try {
      const { data: usuario, error: dbError } =
        await getUsuarioPorTelefono(numeroLimpio);

      if (dbError || !usuario) {
        setBanner({ tipo: "error", msj: "Acceso no autorizado." });
        return;
      }

      // --- MODO LOGIN ---
      if (!esRegistro) {
        if (usuario.password !== form.password) {
          setBanner({ tipo: "error", msj: "Contraseña incorrecta." });
          return;
        }

        const plan = usuario.modo_acceso || "solo_movil";

        // 3. Validación de Vinculación de Equipo
        if (plan !== "libre" && plan !== "sesion_unica") {
          // Validar que el tipo de equipo coincida con el plan
          if (plan === "solo_movil" && columnaID !== "id_movil") {
            setBanner({
              tipo: "error",
              msj: "Este plan solo permite acceso desde móviles.",
            });
            return;
          }
          if (plan === "solo_laptop" && columnaID !== "id_laptop") {
            setBanner({
              tipo: "error",
              msj: "Este plan solo permite acceso desde computadores.",
            });
            return;
          }

          // Validar si ya hay un equipo específico vinculado
          // Comparamos contra el nombre del equipo guardado en la DB
          if (usuario[columnaID] && usuario[columnaID] !== nombreEquipo) {
            setBanner({
              tipo: "error",
              msj: "Equipo no autorizado para esta cuenta.",
            });
            return;
          }
        }

        // 4. Inicio de Sesión Seguro (Pateador de sesiones)
        // Usamos un nuevo Token para asegurar que solo haya una sesión activa si el plan lo exige
        const miTokenFinal =
          plan === "doble_dispositivo" || plan === "libre"
            ? usuario.login_token || crypto.randomUUID()
            : crypto.randomUUID();

        const { data: userUpd, error: sErr } = await iniciarSesionSegura(
          numeroLimpio,
          columnaID,
          nombreEquipo, // Guardamos el nombre "humano" del equipo
          miTokenFinal,
        );

        if (sErr) throw sErr;

        setBanner({ tipo: "success", msj: "¡Acceso concedido!" });
        setCargando(true);

        // Cargar datos iniciales antes de entrar
        await cargarPlantasHome();

        // El login actualiza el contexto y el Router hará el resto (redirigir a Home o Perfil)
        setTimeout(() => login(userUpd), 800);
      } else {
        // --- MODO REGISTRO ---
        if (form.password !== form.confirmPassword) {
          setBanner({ tipo: "error", msj: "Las contraseñas no coinciden." });
          return;
        }

        setCargando(true);
        const { error: regErr } = await activarUsuario(numeroLimpio, {
          ...form,
          columnaID,
          deviceID: nombreEquipo, // Registra el primer equipo automáticamente
        });

        if (regErr) throw regErr;

        setEsRegistro(false);
        setCargando(false);
        setBanner({
          tipo: "success",
          msj: "Registro completado. Ya puedes iniciar sesión.",
        });
      }
    } catch (err) {
      console.error(err);
      setBanner({ tipo: "error", msj: "Error de red o servidor." });
      setCargando(false);
    }
  };

  if (cargando && !esRegistro) return <Spinner />;

  return (
    <div style={styles.pageWrapper}>
      <LoginFormView
        form={form}
        esRegistro={esRegistro}
        banner={banner}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onToggleMode={() => {
          setEsRegistro(!esRegistro);
          setBanner({ tipo: "", msj: "" });
        }}
      />
    </div>
  );
};

const styles = {
  pageWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100vw",
    backgroundImage: `url(${fondoOzain})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "20px",
  },
};
