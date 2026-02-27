import { useState, useEffect } from "react";
import {
  FaEraser,
  FaPhoneAlt,
  FaUserPlus,
  FaMicrochip,
  FaUserLock,
  FaShieldAlt,
} from "react-icons/fa";
import { BsCalendar2Check } from "react-icons/bs";
import { supabase } from "../../../supabaseClient";
import { BotonPrincipal } from "../../ui/BotonPrincipal";
import { ResumenCard } from "./ResumenCard";
import { isValidPhone } from "../../../helpers/textHelper";


export const ActionCard = ({ usuario, onRefresh, resetPadre }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [datosResumen, setDatosResumen] = useState(null);

  const [config, setConfig] = useState({
    telefono: "",
    diasASumar: 0,
    resetMovil: false,
    resetLaptop: false,
    hardReset: false,
    modoAcceso: "",
    rol: "",
  });

  useEffect(() => {
    // 1. Si acabamos de guardar con éxito, no tocamos nada para ver el Resumen.
    if (success) return;

    // 2. Si hay un usuario (Edición) o si es nuevo (Registro):
    // Inicializamos TODO en vacío para obligar al administrador a configurar.
    setConfig({
      telefono: usuario?.telefono || "", // El teléfono es lo único que mantenemos para saber a quién editamos
      diasASumar: 0,
      hardReset: false,
      modoAcceso: "", // ⬅️ Forzamos vacío aunque el usuario ya tenga uno
      rol: "", // ⬅️ Forzamos vacío aunque el usuario ya tenga uno
    });

    // 3. Limpiamos estados de éxito anteriores
    setSuccess(false);
    setDatosResumen(null);
  }, [usuario?.id, usuario?.telefono, success]);


  const aplicarGatilloMaestro = async () => {
    if (!isValidPhone(config.telefono)) return;

    setLoading(true);
    try {
      let infoResumen = { telefono: config.telefono.trim() };
      let cambios = {};

      // --- 1. CASO: REGISTRO NUEVO ---
      if (!usuario?.id) {
        const fechaVence = new Date();
        fechaVence.setDate(fechaVence.getDate() + 7); // 7 días de prueba por defecto

        const nuevoUsuario = {
          telefono: config.telefono.trim(),
          rol: config.rol || "Usuario",
          status: "PENDIENTE",
          modo_acceso: config.modoAcceso || "solo_movil",
          suscripcion_vence: fechaVence.toISOString(),
        };

        const { error } = await supabase
          .from("usuarios")
          .insert([nuevoUsuario]);
        if (error) throw error;

        // Preparamos resumen de bienvenida
        infoResumen = {
          ...infoResumen,
          rol: nuevoUsuario.rol,
          plan: "7 días (Prueba)",
          acceso: "Solo móvil",
        };
      } else {
        // --- 2. CASO: ACTUALIZACIÓN (Solo lo modificado) ---

        // A. Cambio de Rol
        if (config.rol && config.rol !== usuario.rol) {
          cambios.rol = config.rol;
          infoResumen.rol = config.rol;
        }

        // B. Cambio de Modo de Acceso
        if (config.modoAcceso && config.modoAcceso !== usuario.modo_acceso) {
          cambios.modo_acceso = config.modoAcceso;
          infoResumen.acceso = config.modoAcceso;
        }

        // C. Tiempo (Suscripción)
        if (config.diasASumar > 0) {
          const v = new Date(usuario.suscripcion_vence || new Date());
          v.setDate(v.getDate() + parseInt(config.diasASumar));
          cambios.suscripcion_vence = v.toISOString();
          infoResumen.plan = `+ ${config.diasASumar} Días`;
        }

        // D. Hardware & Sesión (HARD RESET)
        // Se activa si marcaste el checkbox O si hubo cambios arriba (para forzar refresh)
        if (config.hardReset || Object.keys(cambios).length > 0) {
          cambios.session_id = null;
          cambios.login_token = null;

          // Si específicamente es por cambio de equipo (Checkbox), limpiamos IDs físicos
          if (config.hardReset) {
            cambios.id_movil = null;
            cambios.id_laptop = null;
            infoResumen.hardware = "Reseteo de equipos vinculados";
          }
        }

        // Ejecutar Update si hay cambios detectados
        if (Object.keys(cambios).length > 0) {
          const { error } = await supabase
            .from("usuarios")
            .update(cambios)
            .eq("id", usuario.id);

          if (error) throw error;
        } else {
          infoResumen.status = "SIN CAMBIOS REALIZADOS";
        }
      }

      // --- 3. FINALIZACIÓN ---
      setDatosResumen(infoResumen);
      setSuccess(true);

      // Refresco silencioso para que UserCard vea los cambios sin cerrar el Resumen
      if (onRefresh) onRefresh(null, true);
    } catch (err) {
      console.error("Error en Operación:", err.message);
      alert("Error al procesar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {success ? (
        <ResumenCard data={datosResumen} onLimpiar={resetPadre} />
      ) : (
        <div style={styles.card}>
          <div style={styles.header}>
            <span style={styles.title}>CENTRO DE OPERACIONES</span>
            <button onClick={resetPadre} style={styles.btnLimpiar}>
              <FaEraser /> LIMPIAR
            </button>
          </div>

          {!usuario?.id ? (
            <Section icon={<FaPhoneAlt />} label="NUEVO REGISTRO: TELÉFONO">
              <input
                style={styles.input}
                placeholder="Ej: 51999888777"
                value={config.telefono}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    telefono: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </Section>
          ) : (
            <>
              {/* SELECT DE ROL TRANSPARENTE */}
              <Section icon={<FaShieldAlt />} label="Rol de Usuario">
                <select
                  style={styles.input}
                  value={config.rol}
                  onChange={(e) =>
                    setConfig({ ...config, rol: e.target.value })
                  }
                >
                  <option value="">Escoger rol</option>
                  <option value="Usuario">Usuario</option>
                  <option value="Colaborador">Colaborador</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </Section>

              <Section
                icon={<BsCalendar2Check />}
                label="Extender Subscripción"
              >
                <select
                  style={styles.input}
                  value={config.diasASumar}
                  onChange={(e) =>
                    setConfig({ ...config, diasASumar: e.target.value })
                  }
                >
                  <option value="0">Escoger plan</option>
                  <option value="7">Periodo de prueba +7 Días</option>
                  <option value="30">Plan Mensual +30 Días</option>
                  <option value="60">Plan Bimestral +60 Días</option>
                  <option value="90">Plan Trimestral +90 Días</option>
                  <option value="365">Plan Anual +365 Días</option>
                </select>
              </Section>

              <Section icon={<FaUserLock />} label="Modo de Acceso">
                <select
                  style={styles.input}
                  value={config.modoAcceso}
                  onChange={(e) =>
                    setConfig({ ...config, modoAcceso: e.target.value })
                  }
                >
                  <option value="">Escoger modo de acceso</option>
                  <option value="solo_movil">(1 móvil)</option>
                  <option value="solo_laptop">(1 laptop)</option>
                  <option value="sesion_unica">(1 Sesión Única)</option>
                  <option value="doble_dispositivo">
                    (2 Sesiones)
                  </option>
                  <option value="libre">Libre</option>
                </select>
              </Section>

              <Section icon={<FaMicrochip />} label="Hardware Reset">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                  <label style={{ ...styles.check, color: "#C62828" }}>
                    <input
                      type="checkbox"
                      checked={config.hardReset}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          hardReset: e.target.checked,
                          resetMovil: false,
                          resetLaptop: false,
                        })
                      }
                    />{" "}
                    <b>Hard Reset</b>
                  </label>
                </div>
              </Section>
            </>
          )}

          <BotonPrincipal
            texto={usuario?.id ? "GUARDAR CAMBIOS" : "REGISTRAR USUARIO"}
            icono={!usuario?.id && <FaUserPlus />}
            onClick={aplicarGatilloMaestro}
            estaCargando={loading}
          />
        </div>
      )}
    </div>
  );
};

const Section = ({ icon, label, children }) => (
  <div style={{ marginBottom: "1.2rem" }}>
    <label style={styles.labelTitle}>
      {icon} {label}
    </label>
    {children}
  </div>
);

const styles = {
  card: {
    background: "white",
    padding: "1.2rem",
    borderRadius: "15px",
    border: "1px solid #2D5A27",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    alignItems: "center",
  },
  title: {
    fontSize: "11px",
    fontWeight: "900",
    color: "#2D5A27",
    letterSpacing: "1px",
  },
  btnLimpiar: {
    background: "none",
    border: "none",
    color: "#C62828",
    fontSize: "0.7rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  labelTitle: {
    fontSize: "0.7rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    color: "#999",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #EEE",
    fontSize: "0.85rem",
    background: "#F9F9F9",
    outline: "none",
  },
  check: {
    fontSize: "0.8rem",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
  },
};
