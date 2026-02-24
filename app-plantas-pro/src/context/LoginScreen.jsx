import { useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { LoginFormView } from "./LoginFormView";
import {
  getUsuarioPorTelefono,
  activarUsuario,
  iniciarSesionSegura,
} from "../services/usuariosServices";
import { obtenerIdentidad } from "../helpers/identidadHelper";
import { PlantasContext } from "./PlantasContext";
import { Spinner } from "../components/ui/Spinner";
import { supabase } from "../supabaseClient";
import fondoOzain from "../assets/fondoLogin.jpg";

export const LoginScreen = () => {
  const { login, logout, user } = useContext(AuthContext);
  const { cargarPlantasHome } = useContext(PlantasContext);
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [banner, setBanner] = useState({ tipo: "", msj: "" });

  const [form, setForm] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    documento: "",
    correo: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  // --- 1. LÓGICA DE REALTIME (EXPULSIÓN) ---
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`session-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "usuarios",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const { session_id, status } = payload.new;
          // Si el token cambió y no es 'libre', cerramos sesión
          if (session_id !== "libre" && session_id !== user.session_id)
            logout();
          if (status !== "ACTIVO") logout();
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, logout]);

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

    // --- 2. GESTIÓN DEL DNI DEL EQUIPO (MARCADO) ---
    let deviceID = localStorage.getItem("ozain_device_id");
    if (!deviceID) {
      deviceID = crypto.randomUUID();
      localStorage.setItem("ozain_device_id", deviceID);
    }

    try {
      const { data: usuario, error: dbError } =
        await getUsuarioPorTelefono(numeroLimpio);

      if (dbError || !usuario) {
        setBanner({ tipo: "error", msj: "Número no autorizado." });
        return;
      }

      // --- 3. VALIDACIÓN DE SUSCRIPCIÓN ---
      if (
        usuario.suscripcion_vence &&
        new Date() > new Date(usuario.suscripcion_vence)
      ) {
        setBanner({
          tipo: "error",
          msj: "Suscripción anual vencida. Contacta soporte.",
        });
        return;
      }

      if (!esRegistro) {
        // --- MODO LOGIN ---
        if (usuario.status !== "ACTIVO") {
          setBanner({
            tipo: "info",
            msj: "Número autorizado. Regístrate para activar.",
          });
          return;
        }
        if (usuario.password !== form.password) {
          setBanner({ tipo: "error", msj: "Contraseña incorrecta." });
          return;
        }

        // VALIDAR EQUIPO (DNI MARCADO)
        if (usuario.session_id !== "libre") {
          if (usuario[columnaID] && usuario[columnaID] !== deviceID) {
            setBanner({
              tipo: "error",
              msj: `Este número ya está vinculado a otro ${columnaID === "id_movil" ? "móvil" : "equipo"}.`,
            });
            return;
          }
        }

        const { data: userUpd, nuevoToken } = await iniciarSesionSegura(
          numeroLimpio,
          columnaID,
          deviceID,
        );

        setBanner({ tipo: "success", msj: "¡Bienvenido!" });
        setCargando(true);
        cargarPlantasHome();
        setTimeout(() => login({ ...userUpd, session_id: nuevoToken }), 1000);
      } else {
        // --- MODO REGISTRO ---
        if (usuario.status === "ACTIVO") {
          setBanner({
            tipo: "info",
            msj: "Esta cuenta ya está activa. Inicia sesión.",
          });
          return;
        }
        if (form.password !== form.confirmPassword) {
          setBanner({ tipo: "error", msj: "Las contraseñas no coinciden." });
          return;
        }

        setCargando(true);
        const nuevoAlias = obtenerIdentidad({
          nombre: form.primerNombre,
          apellido: form.primerApellido,
          telefono: numeroLimpio,
        });

        const { error: regErr } = await activarUsuario(numeroLimpio, {
          ...form,
          documento_identidad: form.documento,
          alias: nuevoAlias,
          columnaID,
          deviceID,
        });

        if (regErr) throw regErr;

        setBanner({
          tipo: "success",
          msj: "¡Registro exitoso! Inicia sesión.",
        });
        setEsRegistro(false);
        setCargando(false);
      }
    } catch (err) {
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
