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

  // --- 1. LISTENER DE EXPULSIÓN EN TIEMPO REAL ---
  useEffect(() => {
    if (!user || !user.id || user.modo_acceso === "libre") return;

    const channel = supabase
      .channel(`user-session-${user.id}`)
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

          // Si el UUID de sesión cambió en la DB, expulsamos al anterior
          if (session_id !== user.session_id) {
            console.warn("Sesión cerrada: Acceso en otro dispositivo.");
            logout();
          }
          if (status !== "ACTIVO") logout();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    // DNI Digital del equipo (UUID local)
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

      // Validación de Suscripción
      if (
        usuario.suscripcion_vence &&
        new Date() > new Date(usuario.suscripcion_vence)
      ) {
        setBanner({ tipo: "error", msj: "Suscripción anual vencida." });
        return;
      }

      if (!esRegistro) {
        // --- MODO LOGIN ---
        if (usuario.status !== "ACTIVO") {
          setBanner({ tipo: "info", msj: "Número pendiente de registro." });
          return;
        }
        if (usuario.password !== form.password) {
          setBanner({ tipo: "error", msj: "Contraseña incorrecta." });
          return;
        }

        // --- 2. FILTROS DE ACCESO DESCRIPTIVOS ---
        const plan = usuario.modo_acceso || "solo_movil";

        if (plan !== "libre") {
          // Bloqueo por tipo de equipo (Negocio)
          if (plan === "solo_movil" && columnaID !== "id_movil") {
            setBanner({
              tipo: "error",
              msj: " Plan exclusivo para móviles.",
            });
            return;
          }
          if (plan === "solo_laptop" && columnaID !== "id_laptop") {
            setBanner({
              tipo: "error",
              msj: " Plan exclusivo para computadores.",
            });
            return;
          }

          // Bloqueo por Vinculación (Seguridad Técnica)
          // Si el "asiento" (id_movil o id_laptop) ya está ocupado por otro UUID
          if (usuario[columnaID] && usuario[columnaID] !== deviceID) {
            const equipoTxt = columnaID === "id_movil" ? "móvil" : "PC";
            setBanner({
              tipo: "error",
              msj: ` Este número ya está vinculado a otro ${equipoTxt}.`,
            });
            return;
          }
        }

        // Iniciar Sesión (Actualiza UUID de sesión y vincula equipo si estaba vacío)
        const {
          data: userUpd,
          nuevoToken,
          error: sErr,
        } = await iniciarSesionSegura(numeroLimpio, columnaID, deviceID);

        if (sErr) throw sErr;

        setBanner({ tipo: "success", msj: "¡Acceso concedido! Entrando..." });
        setCargando(true);

        // El cargarPlantasHome debe ejecutarse antes de entrar para tener datos listos
        await cargarPlantasHome();

        // Guardamos en el AuthContext el usuario "aplanado" con su nuevo token
        setTimeout(() => login({ ...userUpd, session_id: nuevoToken }), 1000);
      } else {
        // --- MODO REGISTRO ---
        if (usuario.status === "ACTIVO") {
          setBanner({ tipo: "info", msj: "Esta cuenta ya está activa." });
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

        // Registrar con la columnaID y deviceID actuales
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
          msj: "¡Registro exitoso! Ya puedes iniciar sesión.",
        });
        setEsRegistro(false);
        setCargando(false);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setBanner({ tipo: "error", msj: "Error al conectar con el servidor." });
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
