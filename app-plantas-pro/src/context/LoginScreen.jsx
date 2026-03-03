import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { PlantasContext } from "../context/PlantasContext";
import { supabase } from "../supabaseClient"; // Import direct para update quirúrgico
import {
  getUsuarioPorTelefono,
  iniciarSesionSegura,
} from "../services/usuariosServices";
import { cleanNumeric, isValidPhone } from "../helpers/phoneHelper";
import {
  getCleanHardwareName,
  detectarTipoCampo,
} from "../helpers/hardwareHelper";
import { obtenerIdentidad } from "../helpers/identidadHelper";
import { Spinner } from "../components/ui/Spinner";
import { LoginFormView } from "./LoginFormView";

export const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const { cargarPlantasHome } = useContext(PlantasContext);

  const [modo, setModo] = useState("login");
  const [cargando, setCargando] = useState(false);
  const [banner, setBanner] = useState({ tipo: "", msj: "" });

  const [form, setForm] = useState({
    telefono: "",
    password: "",
    confirmPassword: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    documento_identidad: "",
    email: "",
  });

  const handleInputChange = ({ target }) =>
    setForm({ ...form, [target.name]: target.value });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setBanner({ tipo: "", msj: "" });

    const numeroLimpio = cleanNumeric(form.telefono);
    if (!isValidPhone(numeroLimpio)) {
      setBanner({ tipo: "error", msj: "Número inválido." });
      return;
    }

    const columnaID = detectarTipoCampo();
    const nombreEquipo = getCleanHardwareName();

    try {
      const { data: usuario, error: dbError } =
        await getUsuarioPorTelefono(numeroLimpio);

      if (dbError || !usuario) {
        setBanner({ tipo: "error", msj: "Número no autorizado." });
        return;
      }

      // 🚨 EL CANDADO MAESTRO DE SEGURIDAD
      // Si está bloqueado, lo rebotamos aquí mismo. Ni siquiera le decimos si la contraseña era correcta.
      if (usuario.status?.toUpperCase() === "BLOQUEADO") {
        setBanner({
          tipo: "error",
          msj: "Acceso denegado. Esta cuenta se encuentra inhabilitada.",
        });
        return; // Cortamos la ejecución, nunca llega a iniciarSesionSegura
      }

      if (modo === "login") {
        // --- LÓGICA LOGIN ---
        if (usuario.password !== form.password) {
          setBanner({ tipo: "error", msj: "Contraseña incorrecta." });
          return;
        }

        // (Validaciones de hardware y plan se mantienen igual...)
        const { data: userUpd, error: sErr } = await iniciarSesionSegura(
          numeroLimpio,
          columnaID,
          nombreEquipo,
          crypto.randomUUID(),
        );

        if (sErr) throw sErr;
        setCargando(true);
        await cargarPlantasHome();
        setTimeout(() => login(userUpd), 800);
      } else {
        // --- LÓGICA ACTIVACIÓN ---
        if (usuario.status !== "PENDIENTE") {
          setBanner({
            tipo: "info",
            msj: "La cuenta ya está activa o procesada.",
          });
          setModo("login");
          return;
        }

        if (form.password !== form.confirmPassword) {
          setBanner({ tipo: "error", msj: "Las contraseñas no coinciden." });
          return;
        }

        const aliasGenerado = obtenerIdentidad({
          nombre: form.primerNombre,
          apellido: form.primerApellido,
          telefono: numeroLimpio,
        });

        setCargando(true);

        // HACEMOS EL UPDATE DIRECTO
        const { error: regErr } = await supabase
          .from("usuarios")
          .update({
            nombre: form.primerNombre,
            segundo_nombre: form.segundoNombre,
            apellido: form.primerApellido,
            segundo_apellido: form.segundoApellido,
            documento_identidad: form.documento_identidad,
            email: form.email,
            password: form.password,
            alias: aliasGenerado,
            status: "ACTIVO",
            [columnaID]: nombreEquipo, // Vincula el equipo actual
          })
          .eq("telefono", numeroLimpio);

        if (regErr) throw regErr;

        setModo("login");
        setBanner({
          tipo: "success",
          msj: "¡Activado! Tus 7 días de prueba están listos.",
        });
        setCargando(false);
      }
    } catch (err) {
      setBanner({ tipo: "error", msj: err.message || "Error de red." });
      setCargando(false);
    }
  };

  return (
    <LoginFormView
      modo={modo}
      setModo={setModo}
      form={form}
      banner={banner}
      onChange={handleInputChange}
      onSubmit={handleSubmit}
      cargando={cargando}
    />
  );
};
