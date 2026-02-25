import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { LoginFormView } from "./LoginFormView";
import {
  getUsuarioPorTelefono,
  activarUsuario,
  iniciarSesionSegura,
} from "../services/usuariosServices";
import { PlantasContext } from "./PlantasContext";
import { Spinner } from "../components/ui/Spinner";
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

  const detectarTipoDispositivo = () => {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent)
      ? "id_movil"
      : "id_laptop";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner({ tipo: "", msj: "" });
    const numeroLimpio = form.telefono.replace(/\D/g, "");
    const columnaID = detectarTipoDispositivo();

    let deviceID =
      localStorage.getItem("ozain_device_id") || crypto.randomUUID();
    localStorage.setItem("ozain_device_id", deviceID);

    try {
      const { data: usuario, error: dbError } =
        await getUsuarioPorTelefono(numeroLimpio);

      if (dbError || !usuario) {
        setBanner({ tipo: "error", msj: "Número no autorizado." });
        return;
      }

      if (!esRegistro) {
        if (usuario.password !== form.password) {
          setBanner({ tipo: "error", msj: "Contraseña incorrecta." });
          return;
        }

        const plan = usuario.modo_acceso || "solo_movil";

        // --- 1. VALIDACIÓN DE VINCULACIÓN (HARDWARE) ---
        if (plan !== "libre" && plan !== "sesion_unica") {
          if (plan === "solo_movil" && columnaID !== "id_movil") {
            setBanner({ tipo: "error", msj: "Plan exclusivo para móviles." });
            return;
          }
          if (plan === "solo_laptop" && columnaID !== "id_laptop") {
            setBanner({
              tipo: "error",
              msj: "Plan exclusivo para computadores.",
            });
            return;
          }
          // Si ya tiene un equipo vinculado de ese tipo, debe ser el mismo
          if (usuario[columnaID] && usuario[columnaID] !== deviceID) {
            setBanner({ tipo: "error", msj: "Equipo no vinculado." });
            return;
          }
        }

        // --- 2. LÓGICA DEL TOKEN (PATEADOR) ---
        let miTokenFinal;

        if (plan === "doble_dispositivo" || plan === "libre") {
          // Reutilizamos el token de la DB para que no se pateen entre sí
          miTokenFinal = usuario.login_token || crypto.randomUUID();
        } else {
          // Generamos uno nuevo para expulsar cualquier sesión previa
          miTokenFinal = crypto.randomUUID();
        }

        const { data: userUpd, error: sErr } = await iniciarSesionSegura(
          numeroLimpio,
          columnaID,
          deviceID,
          miTokenFinal,
        );

        if (sErr) throw sErr;

        setBanner({ tipo: "success", msj: "¡Bienvenido!" });
        setCargando(true);
        await cargarPlantasHome();

        setTimeout(() => login(userUpd), 800);
      } else {
        // Lógica de registro
        if (form.password !== form.confirmPassword) {
          setBanner({ tipo: "error", msj: "Las contraseñas no coinciden." });
          return;
        }
        setCargando(true);
        const { error: regErr } = await activarUsuario(numeroLimpio, {
          ...form,
          columnaID,
          deviceID,
        });
        if (regErr) throw regErr;
        setEsRegistro(false);
        setCargando(false);
        setBanner({ tipo: "success", msj: "Registro exitoso." });
      }
    } catch (err) {
      console.log(err)
      setBanner({ tipo: "error", msj: "Error de conexión." });
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
