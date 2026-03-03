import { useState } from "react";
import {
  TbCloverFilled,
  TbLock,
  TbPhone,
  TbUser,
  TbId,
  TbMail,
  TbEye,
  TbEyeOff,
} from "react-icons/tb";
import { BotonPrincipal } from "../components/ui/BotonPrincipal";
import { StatusBanner } from "../components/ui/StatusBanner";
import { Copyright } from "../components/ui/Copyright"; // 👈 1. IMPORTAS TU COMPONENTE
import fondoOzain from "../assets/fondoLogin.jpg";
import "./LoginStyles.css";

export const LoginFormView = ({
  modo,
  setModo,
  form,
  banner,
  onChange,
  onSubmit,
  cargando,
}) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div
      className="oz-login-main"
      style={{ backgroundImage: `url(${fondoOzain})` }}
    >
      <div className="oz-glass-card">
        <header className="oz-brand">
          <TbCloverFilled className="oz-logo" size={45} />
          <h1>Herbolario de Ozain</h1>
          <p>
            {modo === "login" ? "Acceso Protegido" : "Formulario de Activación"}
          </p>
        </header>

        <nav className="oz-nav-tabs">
          <button
            className={modo === "login" ? "active" : ""}
            onClick={() => setModo("login")}
          >
            LOGIN
          </button>
          <button
            className={modo === "activar" ? "active" : ""}
            onClick={() => setModo("activar")}
          >
            ACTIVAR
          </button>
        </nav>

        {banner.msj && (
          <div style={{ marginBottom: "25px" }}>
            <StatusBanner status={banner.tipo} message={banner.msj} />
          </div>
        )}

        <form onSubmit={onSubmit} className="oz-form-body">
          <div className="oz-field">
            <label>
              <TbPhone /> CELULAR AUTORIZADO
            </label>
            <input
              name="telefono"
              type="tel"
              value={form.telefono}
              onChange={onChange}
              placeholder="51999888777"
              required
            />
          </div>

          {modo === "activar" && (
            <div
              className="oz-animate"
              style={{ display: "flex", flexDirection: "column", gap: "22px" }}
            >
              <div className="oz-field">
                <label>
                  <TbUser /> PRIMER NOMBRE *
                </label>
                <input
                  name="primerNombre"
                  value={form.primerNombre}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="oz-field">
                <label>
                  <TbUser /> PRIMER APELLIDO *
                </label>
                <input
                  name="primerApellido"
                  value={form.primerApellido}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="oz-field">
                <label>
                  <TbId /> DOCUMENTO IDENTIDAD *
                </label>
                <input
                  name="documento_identidad"
                  value={form.documento_identidad}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="oz-field">
                <label>
                  <TbMail /> CORREO ELECTRÓNICO *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="oz-field">
            <label>
              <TbLock /> {modo === "login" ? "CONTRASEÑA" : "CREAR CONTRASEÑA"}
            </label>
            <div className="oz-input-wrapper">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                required
              />
              <button
                type="button"
                className="oz-eye"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <TbEyeOff /> : <TbEye />}
              </button>
            </div>
          </div>

          {modo === "activar" && (
            <div className="oz-field oz-animate">
              <label>
                <TbLock /> CONFIRMAR CONTRASEÑA
              </label>
              <div className="oz-input-wrapper">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={onChange}
                  required
                />
                <button
                  type="button"
                  className="oz-eye"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: "10px" }}>
            <BotonPrincipal
              onClick={onSubmit}
              texto={modo === "login" ? "INGRESAR" : "COMPLETAR REGISTRO"}
              estaCargando={cargando}
            />
          </div>
        </form>

        <footer className="oz-footer">
          <div className="oz-line" style={{ marginBottom: "15px" }} />
          {/* 👈 2. REEMPLAZAS EL TEXTO FIJO POR EL COMPONENTE */}
          <Copyright colorTexto="#666" colorTrébol="var(--color-frondoso)" />
        </footer>
      </div>
    </div>
  );
};
