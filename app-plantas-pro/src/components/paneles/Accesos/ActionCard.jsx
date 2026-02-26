import { useState, useEffect } from "react";
import {
  FaEraser,
  FaPhoneAlt,
  FaUserPlus,
  FaMicrochip,
  FaUserLock,
} from "react-icons/fa";
import { BsCalendar2Check } from "react-icons/bs";
import { supabase } from "../../../supabaseClient";
import { BotonPrincipal } from "../../ui/BotonPrincipal";
import { ResumenCard } from "./ResumenCard";
import { isValidPhone } from "../../../helpers/textHelper";
import { formatearFechaLocal } from "../../../helpers/timeHelper";

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
    rol:"",
  });

  useEffect(() => {
    if (usuario?.id) {
      setConfig({
        telefono: usuario.telefono || "",
        modoAcceso: usuario.modo_acceso || "",
        rol: usuario.rol || "",
        diasASumar: 0,
        resetMovil: false,
        resetLaptop: false,
        hardReset: false,
      });
    }
  }, [usuario]);

  const aplicarGatilloMaestro = async () => {
    // Validación silenciosa: si no es válido, no hace nada (o puedes usar un alert simple)
    if (!isValidPhone(config.telefono)) return;

    setLoading(true);
    try {
      let infoResumen = { telefono: config.telefono.trim() };
      let cambios = {};

      if (!usuario?.id) {
        // --- REGISTRO NUEVO ---
        const fechaVence = new Date();
        fechaVence.setDate(fechaVence.getDate() + 7);
        const { error } = await supabase.from("usuarios").insert([
          {
            telefono: config.telefono.trim(),
            rol: "Usuario",
            status: "PENDIENTE",
            modo_acceso: "solo_movil",
            suscripcion_vence: fechaVence.toISOString(),
          },
        ]);
        if (error) throw error;

        infoResumen = {
          ...infoResumen,
          status: "PENDIENTE",
          plan: "7 días",
          vence: formatearFechaLocal(fechaVence),
          acceso: "solo_movil",
        };
      } else {
        // --- ACTUALIZACIÓN (Manual Deletion Structure) ---
        if (config.hardReset) {
          cambios = {
            id_movil: null,
            id_laptop: null,
            sesion_id: null,
            login_token: null,
          };
          infoResumen.hardware = "HARD RESET";
        } else {
          if (config.resetMovil) cambios.id_movil = null;
          if (config.resetLaptop) cambios.id_laptop = null;
          if (config.resetMovil || config.resetLaptop)
            infoResumen.hardware = "Reset Parcial";
        }

        if (config.modoAcceso && config.modoAcceso !== usuario.modo_acceso) {
          cambios.modo_acceso = config.modoAcceso;
          infoResumen.acceso = config.modoAcceso;
        }

        if (config.diasASumar > 0) {
          const v = new Date(usuario.suscripcion_vence || new Date());
          v.setDate(v.getDate() + parseInt(config.diasASumar));
          cambios.suscripcion_vence = v.toISOString();
          infoResumen.plan = `+${config.diasASumar} Días`;
          infoResumen.vence = formatearFechaLocal(v);
        }

        const { error } = await supabase
          .from("usuarios")
          .update(cambios)
          .eq("id", usuario.id);
        if (error) throw error;
        infoResumen.status = "ACTUALIZADO";
      }

      setDatosResumen(infoResumen);
      setSuccess(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error en operación:", err.message);
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
                  <option value="7">Periodo de prueba (+7 Días)</option>
                  <option value="30">Plan Mensual (+30 Días)</option>
                  <option value="60">Plan Bimestral (+60 Días)</option>
                  <option value="90">Plan Trimestral (+90 Días)</option>
                  <option value="180">Plan Semestral (+180 Días)</option>
                  <option value="365">Plan Anual (+365 Días)</option>
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
                  <option value="solo_movil">solo_movil (1 móvil)</option>
                  <option value="solo_laptop">solo_laptop (1 laptop)</option>
                  <option value="sesion_unica">sesion_unica (1S)</option>
                  <option value="doble_dispositivo">
                    doble_dispositivo (2S)
                  </option>
                  <option value="libre">libre</option>
                </select>
              </Section>

              <Section icon={<FaMicrochip />} label="Hardware Reset">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                  <label style={styles.check}>
                    <input
                      type="checkbox"
                      checked={config.resetMovil}
                      disabled={config.hardReset}
                      onChange={(e) =>
                        setConfig({ ...config, resetMovil: e.target.checked })
                      }
                    />{" "}
                    Móvil
                  </label>
                  <label style={styles.check}>
                    <input
                      type="checkbox"
                      checked={config.resetLaptop}
                      disabled={config.hardReset}
                      onChange={(e) =>
                        setConfig({ ...config, resetLaptop: e.target.checked })
                      }
                    />{" "}
                    Laptop
                  </label>
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
                    <b>HARD RESET</b>
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
