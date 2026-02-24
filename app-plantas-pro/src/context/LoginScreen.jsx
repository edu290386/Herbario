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

  // --- 1. ESCUCHA DE SESIÓN EN TIEMPO REAL (REALTIME) ---
  useEffect(() => {
    if (!user || !user.id) return;

    const channel = supabase
      .channel(`user-status-${user.id}`)
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

          // Expulsar si el token cambió (y no es modo libre) o si fue bloqueado
          if (session_id !== "libre" && session_id !== user.session_id) {
            console.warn("Sesión invalidada: Acceso desde otro dispositivo.");
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

    // --- 2. GESTIÓN DEL DNI DIGITAL DEL EQUIPO (UUID) ---
    let deviceID = localStorage.getItem("ozain_device_id");
    if (!deviceID) {
      deviceID = crypto.randomUUID();
      localStorage.setItem("ozain_device_id", deviceID);
    }

    try {
      const { data: usuario, error: dbError } =
        await getUsuarioPorTelefono(numeroLimpio);

      if (dbError || !usuario) {
        setBanner({
          tipo: "error",
          msj: "Número no autorizado por el administrador.",
        });
        return;
      }

      // --- 3. VALIDACIÓN DE SUSCRIPCIÓN ---
      if (
        usuario.suscripcion_vence &&
        new Date() > new Date(usuario.suscripcion_vence)
      ) {
        setBanner({
          tipo: "error",
          msj: "Suscripción anual vencida. Contacta al administrador.",
        });
        return;
      }

      if (!esRegistro) {
        // --- MODO LOGIN ---
        if (usuario.status !== "ACTIVO") {
          setBanner({
            tipo: "info",
            msj: "Número autorizado. Por favor, regístrate primero.",
          });
          return;
        }

        if (usuario.password !== form.password) {
          setBanner({ tipo: "error", msj: "Contraseña incorrecta." });
          return;
        }

        // Validación de equipo (Si no es modo libre)
        if (usuario.session_id !== "libre") {
          if (usuario[columnaID] && usuario[columnaID] !== deviceID) {
            setBanner({
              tipo: "error",
              msj: `Acceso denegado. Este número ya está vinculado a otro ${columnaID === "id_movil" ? "móvil" : "computador"}.`,
            });
            return;
          }
        }

        // Iniciar sesión segura y generar nuevo session_id
        const {
          data: userUpd,
          nuevoToken,
          error: sessionErr,
        } = await iniciarSesionSegura(numeroLimpio, columnaID, deviceID);

        if (sessionErr) throw sessionErr;

        setBanner({ tipo: "success", msj: "¡Acceso verificado! Entrando..." });
        setCargando(true);
        cargarPlantasHome();
        setTimeout(() => login({ ...userUpd, session_id: nuevoToken }), 1000);
      } else {
        // --- MODO REGISTRO ---
        if (usuario.status === "ACTIVO") {
          setBanner({
            tipo: "info",
            msj: "Esta cuenta ya está activa. Por favor, inicia sesión.",
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

        // Preparamos el paquete de registro
        const datosRegistro = {
          ...form,
          documento_identidad: form.documento,
          alias: nuevoAlias,
          columnaID,
          deviceID,
        };

        const { error: regErr } = await activarUsuario(
          numeroLimpio,
          datosRegistro,
        );

        if (regErr) throw regErr;

        setBanner({
          tipo: "success",
          msj: "¡Registro completado! Ahora ya puedes iniciar sesión.",
        });
        setEsRegistro(false);
        setCargando(false);
      }
    } catch (err) {
      console.error("Error en Login:", err);
      setBanner({
        tipo: "error",
        msj: "Error al procesar la solicitud. Revisa tu conexión.",
      });
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
        cargando={cargando}
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
