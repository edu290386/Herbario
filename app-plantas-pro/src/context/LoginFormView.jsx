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
  // Estados para controlar la visibilidad de cada contraseña por separado
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);

  return (
    <div style={styles.formCard}>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {/* BLOQUE DE REGISTRO: Cada campo en su propia fila */}
        <div style={styles.registroCampos(esRegistro)}>
          <input
            name="nombre"
            placeholder="Nombres"
            value={form.nombre}
            onChange={onChange}
            style={styles.input}
            required={esRegistro}
          />
          <input
            name="apellido"
            placeholder="Apellidos"
            value={form.apellido}
            onChange={onChange}
            style={styles.input}
            required={esRegistro}
          />
          <input
            name="alias"
            placeholder="Alias (Opcional)"
            value={form.alias}
            onChange={onChange}
            style={styles.input}
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={form.correo}
            onChange={onChange}
            style={styles.input}
            required={esRegistro}
          />
        </div>

        {/* Bloque de Identificación (Siempre visible) */}
        <div style={styles.row}>
          <select
            name="paisCodigo"
            value={form.paisCodigo}
            onChange={onChange}
            style={styles.select}
          >
            <option value="51">🇵🇪 +51</option>
            <option value="57">🇨🇴 +57</option>
            <option value="58">🇻🇪 +58</option>
          </select>
          <input
            type="tel"
            name="telefono"
            placeholder="Celular"
            value={form.telefono}
            onChange={onChange}
            style={{ ...styles.input, flex: 1 }}
            required
          />
        </div>

        {/* CONTRASEÑA PRINCIPAL CON OJO */}
        <div style={{ position: "relative" }}>
          <input
            type={verPass ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={onChange}
            style={{ ...styles.input, paddingRight: "45px" }}
            required
          />
          <button
            type="button"
            onClick={() => setVerPass(!verPass)}
            style={styles.botonOjo}
          >
            {verPass ? <TbEyeOff size={20} /> : <TbEye size={20} />}
          </button>
        </div>

        {/* CONFIRMAR CONTRASEÑA CON SU PROPIO OJO (Solo en registro) */}
        {esRegistro && (
          <div style={{ position: "relative" }}>
            <input
              type={verConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={form.confirmPassword}
              onChange={onChange}
              style={{ ...styles.input, paddingRight: "45px" }}
              required
            />
            <button
              type="button"
              onClick={() => setVerConfirm(!verConfirm)}
              style={styles.botonOjo}
            >
              {verConfirm ? <TbEyeOff size={20} /> : <TbEye size={20} />}
            </button>
          </div>
        )}

        {/* Banner de Error */}
        <div style={styles.errorContainer}>
          {error && (
            <div style={styles.errorBanner}>
              <IoWarningOutline size={20} />
              {error}
            </div>
          )}
        </div>

        <BotonPrincipal
          type="submit"
          estaCargando={cargando}
          esExitoso={exito}
          texto={esRegistro ? "Registrarme" : "Entrar"}
          textoCargando={esRegistro ? "Guardando..." : "Autenticando..."}
          textoExitoso={esRegistro ? "¡Registro Exitoso!" : "¡Bienvenido!"}
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
