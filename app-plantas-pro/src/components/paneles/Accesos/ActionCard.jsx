import { useState, useEffect } from "react";
import {
  FaEraser,
  FaPhoneAlt,
  FaUsers,
  FaUserPlus,
  FaMicrochip,
  FaUserLock,
  FaShieldAlt,
} from "react-icons/fa";
import { BsCalendar2Check } from "react-icons/bs";
import { supabase } from "../../../supabaseClient";
import { BotonPrincipal } from "../../ui/BotonPrincipal";
import { ResumenCard } from "./ResumenCard";
import { cleanNumeric, isValidPhone } from "../../../helpers/textHelper";

const CONFIG_VACIA = {
  diasASumar: 0,
  hardReset: false,
  modoAcceso: "",
  rol: "",
  groupId: "",
};

export const ActionCard = ({ usuario, telefonoBuscado, onRefresh, resetPadre }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [datosResumen, setDatosResumen] = useState(null);

  
  // 2. INICIALIZAMOS EL ESTADO
  const [config, setConfig] = useState({
    ...CONFIG_VACIA,
    telefono: usuario?.telefono || telefonoBuscado || "",
  });

  // 3. EL USEEFFECT MAESTRO
  useEffect(() => {
    if (success) return;
    setConfig({
      ...CONFIG_VACIA,
      telefono: usuario?.telefono || telefonoBuscado || "",
    });
    setSuccess(false);
  }, [usuario, telefonoBuscado, success]);

 const aplicarGatilloMaestro = async () => {
   if (!isValidPhone(config.telefono)) return;
   setLoading(true);

   try {
     const ahora = new Date();
     let fechaBase =
       usuario?.suscripcion_vence && new Date(usuario.suscripcion_vence) > ahora
         ? new Date(usuario.suscripcion_vence)
         : ahora;

     const diasSeleccionados = parseInt(config.diasASumar) || 0;
     const nuevaFecha = new Date(fechaBase);
     nuevaFecha.setDate(
       nuevaFecha.getDate() + (diasSeleccionados + (!usuario?.id ? 7 : 0)),
     );

     let infoResumen = { telefono: config.telefono.trim() };

     if (!usuario?.id) {
       // --- 🟢 REGISTRO NUEVO ---
       const { error } = await supabase.from("usuarios").insert([
         {
           telefono: config.telefono.trim(),
           rol: config.rol || "Usuario",
           status: "PENDIENTE",
           modo_acceso: config.modoAcceso || "solo_movil",
           suscripcion_vence: nuevaFecha.toISOString(),
           grupo_id: config.groupId || null,
         },
       ]);
       if (error) throw error;

       infoResumen = {
         ...infoResumen,
         status: "PENDIENTE",
         rol: "Usuario",
         plan: "7 Días",
       };
     } else {
       // --- 🔵 ACTUALIZACIÓN PROTEGIDA ---
       const cambios = {};

       // CLAVE: Solo agregamos al objeto 'cambios' si el valor NO es una cadena vacía
       if (config.status) {
         cambios.status = config.status;
         infoResumen.status = config.status;
       } else if (parseInt(config.diasASumar) > 0) {
        // ⚡ SI SUMA DÍAS Y NO ELIGIÓ STATUS, LO ACTIVAMOS AUTOMÁTICAMENTE
        cambios.status = "ACTIVO";
        infoResumen.status = "ACTIVO (Auto)";
      }

       if (config.rol) {
         cambios.rol = config.rol;
         infoResumen.rol = config.rol;
       }

       if (config.modoAcceso) {
         cambios.modo_acceso = config.modoAcceso;
         infoResumen.acceso = config.modoAcceso;
       }

       if (config.groupId) {
         cambios.grupo_id = config.groupId;
         infoResumen.grupo = config.groupId;
       }

       // Solo actualizamos la fecha si se seleccionó un plan
       if (diasSeleccionados > 0) {
         cambios.suscripcion_vence = nuevaFecha.toISOString();
         infoResumen.plan = `+${diasSeleccionados} Días`;
       }

       if (config.hardReset) {
         cambios.id_movil = null;
         cambios.id_laptop = null;
         cambios.login_token = null;
         cambios.session_id = null;
         infoResumen.hardware = "RESET REALIZADO";
       }

       // Solo ejecutamos el update si hay al menos un cambio detectado
       if (Object.keys(cambios).length > 0) {
         const { error } = await supabase
           .from("usuarios")
           .update(cambios)
           .eq("id", usuario.id);

         if (error) throw error;
       } else {
         // Si no se tocó nada, avisamos en el resumen
         infoResumen.nota = "No se realizaron cambios";
       }
     }

     setDatosResumen(infoResumen);
     setSuccess(true);
     if (onRefresh) onRefresh(null, true);
   } catch (err) {
     alert("Error: " + err.message);
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
            <Section icon={<FaPhoneAlt />} label="TELÉFONO">
              <input
                style={styles.input}
                value={config.telefono}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    telefono: cleanNumeric(e.target.value),
                  })
                }
                placeholder="Código de país + Teléfono"
              />
              <p
                style={{ fontSize: "10px", color: "#2d5a27", marginTop: "5px" }}
              >
                * Se creará como <b>Usuario</b> con <b>7 días</b> de prueba.
              </p>
            </Section>
          ) : (
            <>
              <Section icon={<FaShieldAlt />} label="Rol">
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
                label="Suscripción"
              >
                <select
                  style={styles.input}
                  value={config.diasASumar}
                  onChange={(e) =>
                    setConfig({ ...config, diasASumar: e.target.value })
                  }
                >
                  <option value="0">Escoger plan</option>
                  <option value="7">+7 Días</option>
                  <option value="30">+30 Días</option>
                  <option value="365">+365 Días</option>
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
                  <option value="">Escoger modo</option>
                  <option value="solo_movil">(1 móvil)</option>
                  <option value="solo_laptop">(1 laptop)</option>
                  <option value="sesion_unica">(1 Sesión Única)</option>
                  <option value="doble_dispositivo">(2 Sesiones)</option>
                  <option value="libre">Libre</option>
                </select>
              </Section>
              <Section icon={<FaMicrochip />} label="Hardware Reset">
                <label style={{ ...styles.check, color: "#C62828" }}>
                  <input
                    type="checkbox"
                    checked={config.hardReset}
                    onChange={(e) =>
                      setConfig({ ...config, hardReset: e.target.checked })
                    }
                  />
                  <b>Hard Reset</b>
                </label>
              </Section>
              <Section icon={<FaUsers />} label="Grupo">
                <input
                  style={styles.input}
                  value={config.groupId}
                  onChange={(e) =>
                    setConfig({ ...config, groupId: e.target.value })
                  }
                  placeholder="Código de grupo..."
                />
              </Section>
            </>
          )}

          <BotonPrincipal
            texto={usuario?.id ? "GUARDAR CAMBIOS" : "REGISTRAR USUARIO"}
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
