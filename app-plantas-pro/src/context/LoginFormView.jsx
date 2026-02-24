import { useState } from "react";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { Footer } from "../components/ui/Footer";
import { IoWarningOutline } from "react-icons/io5";
import { TbEye, TbEyeOff, TbCloverFilled } from "react-icons/tb";

export const LoginFormView = ({
  form,
  esRegistro,
  cargando,
  error,
  onChange,
  onSubmit,
  onToggleMode,
}) => {
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);

  return (
    <div style={styles.formCard}>
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .logo-giratorio { animation: spin-slow 15s linear infinite; }
        input::placeholder { color: #CBD5E0; }
      `}</style>

      {/* CABECERA */}
      <div style={styles.header}>
        <TbCloverFilled size={30} color="#2D5A27" className="logo-giratorio" />
        <h1 style={styles.title}>El Herbario de Ozain</h1>
      </div>

      {/* CONTENIDO UNIFICADO Y SIMÉTRICO */}
      <div style={styles.unifiedContent}>
        <form onSubmit={onSubmit} style={styles.form}>
          {esRegistro && (
            <div style={styles.registroGroup(true)}>
              <div style={styles.field}>
                <label style={styles.label}>Nombres</label>
                <input
                  name="nombre"
                  placeholder="Juan"
                  value={form.nombre}
                  onChange={onChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Apellidos</label>
                <input
                  name="apellido"
                  placeholder="Pérez"
                  value={form.apellido}
                  onChange={onChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  name="correo"
                  placeholder="juan@ejemplo.com"
                  value={form.correo}
                  onChange={onChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Número de Celular</label>
            <input
              type="tel"
              name="telefono"
              placeholder="51999888777"
              value={form.telefono}
              onChange={onChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.passWrapper}>
              <input
                type={verPass ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setVerPass(!verPass)}
                style={styles.eyeBtn}
              >
                {verPass ? <TbEyeOff size={20} /> : <TbEye size={20} />}
              </button>
            </div>
          </div>

          {esRegistro && (
            <div style={styles.field}>
              <label style={styles.label}>Confirmar Contraseña</label>
              <div style={styles.passWrapper}>
                <input
                  type={verConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={onChange}
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerConfirm(!verConfirm)}
                  style={styles.eyeBtn}
                >
                  {verConfirm ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <IoWarningOutline size={16} /> {error}
            </div>
          )}

          <div style={{ marginTop: "10px", width: "100%" }}>
            <BotonPrincipal
              type="submit"
              estaCargando={cargando}
              texto={esRegistro ? "Activar Acceso" : "Iniciar Sesión"}
            />
          </div>
        </form>

        <button type="button" onClick={onToggleMode} style={styles.switchBtn}>
          {esRegistro
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Activa tu acceso"}
        </button>

        <div style={styles.footerDivider} />
        <div style={styles.footerContainer}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

const styles = {
  formCard: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "white",
    padding: "20px 30px 0px 30px",
    borderRadius: "28px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "25px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#1A3A32",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  unifiedContent: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "stretch",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "0.85rem", fontWeight: "700", color: "#4A5568" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1.5px solid #E2E8F0",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  passWrapper: { position: "relative", width: "100%" },
  eyeBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#A0AEC0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  errorBox: {
    padding: "10px",
    backgroundColor: "#FFF5F5",
    color: "#C53030",
    borderRadius: "10px",
    fontSize: "0.85rem",
    border: "1px solid #FED7D7",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "#2D5A27",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.9rem",
    textDecoration: "underline",
    margin: "15px 0",
    alignSelf: "center",
  },
  footerDivider: {
    height: "1.5px",
    backgroundColor: "#F1F5F9",
    width: "100%",
    marginBottom: "20px",
  },
  footerContainer: { width: "100%", display: "flex", justifyContent: "center" },
  registroGroup: (visible) => ({
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxHeight: visible ? "800px" : "0",
    opacity: visible ? 1 : 0,
    overflow: "hidden",
    transition: "0.4s ease",
  }),
};
