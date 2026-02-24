import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { LoginFormView } from "./LoginFormView";
import {
  getUsuarioPorTelefono,
  activarUsuario,
} from "../services/usuariosServices";
import { obtenerIdentidad } from "../helpers/identidadHelper";
import { PlantasContext } from "./PlantasContext";
import { Spinner } from "../components/ui/Spinner";
import fondoOzain from "../assets/fondoLogin.jpg";

export const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const { cargarPlantasHome } = useContext(PlantasContext);
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    password: "",
    confirmPassword: "", // Para la validación de registro
  });

  const handleInputChange = ({ target }) =>
    setForm({ ...form, [target.name]: target.value });

  const detectarDispositivo = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? "id_movil"
      : "id_laptop";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const numeroLimpio = form.telefono.replace(/\D/g, "");
      if (numeroLimpio.length < 8) throw new Error("Número no válido.");

      const { data: usuario, error: dbError } =
        await getUsuarioPorTelefono(numeroLimpio);
      if (dbError || !usuario) throw new Error("Número no registrado.");

      const columnaID = detectarDispositivo();
      const currentFingerprint = navigator.userAgent + navigator.language;

      if (!esRegistro) {
        if (usuario[columnaID] && usuario[columnaID] !== currentFingerprint)
          throw new Error(`Dispositivo no vinculado.`);
        if (usuario.password !== form.password)
          throw new Error("Contraseña incorrecta.");

        setCargando(true);
        cargarPlantasHome();
        setTimeout(() => login(usuario), 2000);
      } else {
        if (usuario.status === "ACTIVO") throw new Error("Ya está activo.");
        if (form.password !== form.confirmPassword)
          throw new Error("Las contraseñas no coinciden.");
        if (!form.correo.includes("@"))
          throw new Error("Correo electrónico inválido.");

        setCargando(true);
        const nuevoAlias = obtenerIdentidad({
          ...form,
          telefono: numeroLimpio,
        });

        await activarUsuario(numeroLimpio, {
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          password: form.password,
          alias: nuevoAlias,
          [columnaID]: currentFingerprint,
          status: "ACTIVO",
        });

        setEsRegistro(false);
        setCargando(false);
        alert("¡Cuenta activada!");
      }
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  if (cargando && !esRegistro) return <Spinner />;

  return (
    <div style={styles.pageWrapper}>
      <LoginFormView
        form={form}
        esRegistro={esRegistro}
        cargando={cargando}
        error={error}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onToggleMode={() => {
          setEsRegistro(!esRegistro);
          setError(null);
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
