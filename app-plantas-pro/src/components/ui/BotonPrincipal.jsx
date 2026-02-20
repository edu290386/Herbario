import "./BotonPrincipal.css";

export const BotonPrincipal = ({
  onClick,
  estaCargando,
  esExitoso,
  texto,
  textoCargando = "Cargando...",
  textoExitoso = "¡LISTO!",
  type = "button",
}) => {
  // Construimos las clases dinámicamente
  const clases = `boton-principal ${esExitoso ? "exitoso" : ""}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={estaCargando || esExitoso}
      className={clases}
    >
      <span className="boton-contenido">
        {esExitoso ? textoExitoso : estaCargando ? textoCargando : texto}
      </span>
    </button>
  );
};
