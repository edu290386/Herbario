import { useState } from "react";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { IoWarningOutline } from "react-icons/io5";
import { TbEye, TbEyeOff } from "react-icons/tb";

export const LoginFormView = ({
  form,
  esRegistro,
  cargando,
  exito,
  error,
  onChange,
  onSubmit,
  onToggleMode,
  styles,
}) => {
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);

  return (
    <div style={styles.formCard}>
      <form onSubmit={onSubmit} style={styles.formElement}>
        {esRegistro && (
          <div style={styles.registroCampos(true)}>
            <div style={styles.fieldGroup}>
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
            <div style={styles.fieldGroup}>
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
          </div>
        )}

        {/* ✅ INPUT ÚNICO: Amigable con Safari/Google Auto-fill */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Número de Celular (con código de país)
          </label>
          <input
            type="tel"
            name="telefono"
            placeholder="Ej: 51999888777"
            value={form.telefono}
            onChange={onChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Contraseña</label>
          <div style={styles.inputRelative}>
            <input
              type={verPass ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              style={{ ...styles.input, paddingRight: "50px" }}
              required
            />
            <button
              type="button"
              onClick={() => setVerPass(!verPass)}
              style={styles.botonOjo}
            >
              {verPass ? <TbEyeOff size={22} /> : <TbEye size={22} />}
            </button>
          </div>
        </div>

        {esRegistro && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirmar Contraseña</label>
            <div style={styles.inputRelative}>
              <input
                type={verConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={onChange}
                style={{ ...styles.input, paddingRight: "50px" }}
                required
              />
              <button
                type="button"
                onClick={() => setVerConfirm(!verConfirm)}
                style={styles.botonOjo}
              >
                {verConfirm ? <TbEyeOff size={22} /> : <TbEye size={22} />}
              </button>
            </div>
          </div>
        )}

        <div style={styles.errorContainer}>
          {error && (
            <div style={styles.errorBanner}>
              <IoWarningOutline size={18} />
              {error}
            </div>
          )}
        </div>

        <BotonPrincipal
          type="submit"
          estaCargando={cargando}
          esExitoso={exito}
          texto={esRegistro ? "Activar Acceso" : "Entrar al Herbario"}
        />
      </form>

      <button onClick={onToggleMode} style={styles.linkButton}>
        {esRegistro
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿No tienes cuenta? Activa tu acceso"}
      </button>
    </div>
  );
};
