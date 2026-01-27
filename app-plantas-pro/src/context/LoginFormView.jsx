import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { IoWarningOutline } from "react-icons/io5";

export const LoginFormView = ({
  form,
  esRegistro,
  cargando,
  exito,
  error,
  onChange,
  onSubmit,
  onToggleMode,
  styles, // Los estilos los recibe del padre para ser flexible
}) => {
  return (
    <div style={styles.formCard}>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {/* Bloque dinámico de campos adicionales (Nombre/Correo) */}
        <div style={styles.registroCampos(esRegistro)}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={onChange}
            style={styles.input}
            required={esRegistro}
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

        {/* Bloque de Identificación */}
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

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={onChange}
          style={styles.input}
          required
        />

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
