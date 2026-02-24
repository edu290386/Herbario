import { useState } from "react";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { StatusBanner } from "../components/ui/StatusBanner";
import { TbEye, TbEyeOff, TbCloverFilled } from "react-icons/tb";

export const LoginFormView = ({
  form,
  esRegistro,
  cargando,
  banner,
  onChange,
  onSubmit,
  onToggleMode,
}) => {
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);
  const anioActual = new Date().getFullYear();

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
        <h1 style={styles.title}>El Herbolario de Ozain</h1>
      </div>

      <div style={styles.unifiedContent}>
        {/* BANNER DINÁMICO SIMÉTRICO */}
        {banner.msj && (
          <div style={styles.bannerWrapper}>
            <StatusBanner status={banner.tipo} message={banner.msj} />
          </div>
        )}

        <form onSubmit={onSubmit} style={styles.form}>
          {esRegistro && (
            <div style={styles.registroGroup}>
              <div style={styles.field}>
                <label style={styles.label}>Primer Nombre *</label>
                <input
                  name="primerNombre"
                  placeholder="Ej: Juan"
                  value={form.primerNombre}
                  onChange={onChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Segundo Nombre</label>
                <input
                  name="segundoNombre"
                  placeholder="Ej: Antonio"
                  value={form.segundoNombre}
                  onChange={onChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Primer Apellido *</label>
                <input
                  name="primerApellido"
                  placeholder="Ej: Pérez"
                  value={form.primerApellido}
                  onChange={onChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Segundo Apellido</label>
                <input
                  name="segundoApellido"
                  placeholder="Ej: García"
                  value={form.segundoApellido}
                  onChange={onChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Documento de Identidad *</label>
                <input
                  name="documento"
                  placeholder="Ej: 45678912"
                  value={form.documento}
                  onChange={onChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Correo Electrónico *</label>
                <input
                  type="email"
                  name="correo"
                  placeholder="ejemplo@correo.com"
                  value={form.correo}
                  onChange={onChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Número de Celular *</label>
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
            <label style={styles.label}>Contraseña *</label>
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
              <label style={styles.label}>Confirmar Contraseña *</label>
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

          <div style={{ marginTop: "10px" }}>
            <BotonPrincipal
              type="submit"
              estaCargando={cargando}
              texto={esRegistro ? "Completar Registro" : "Iniciar Sesión"}
            />
          </div>
        </form>

        <button type="button" onClick={onToggleMode} style={styles.switchBtn}>
          {esRegistro
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </button>

        {/* FOOTER LOCAL SIMÉTRICO */}
        <div style={styles.footerLocal}>
          <div style={styles.footerDivider} />
          <span style={styles.footerText}>
            © {anioActual} El Herbolario de Ozain. <br /> Todos los derechos
            reservados.
          </span>
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
    padding: "35px 30px 25px 30px",
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
  title: { fontSize: "1.4rem", fontWeight: "800", color: "#1A3A32", margin: 0 },
  unifiedContent: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "stretch",
  },
  bannerWrapper: { marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
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
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#A0AEC0",
    cursor: "pointer",
    display: "flex",
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "#2D5A27",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.9rem",
    textDecoration: "underline",
    margin: "20px 0",
    alignSelf: "center",
  },
  footerLocal: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "10px",
  },
  footerDivider: {
    height: "1px",
    backgroundColor: "#E2E8F0",
    width: "100%",
    marginBottom: "15px",
  },
  footerText: {
    fontSize: "0.8rem",
    color: "#A0AEC0",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: "1.4",
  },
  registroGroup: { display: "flex", flexDirection: "column", gap: "18px" },
};
