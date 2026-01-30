import { colores } from "../../constants/tema";

export const BotonPrincipal = ({
  onClick,
  estaCargando,
  esExitoso,
  texto,
  textoCargando = "Cargando...",
  textoExitoso = "Listo!",
  type = "button",
}) => {
  
  const colorFondo = estaCargando ? colores.bosque : colores.frondoso;

  return (
    <button
      type={type}
      onClick={onClick}
      // Se deshabilita si está cargando, si ya fue exitoso o por validaciones externas (foto/gps)
      disabled={estaCargando || esExitoso}
      style={{
        backgroundColor: colorFondo,
        color: "white", // Letra blanca siempre, como propusimos al inicio
        padding: "14px",
        borderRadius: "8px",
        border: "none",
        boxShadow: "8px 2px 20px rgba(0,0,0,0.15)",
        width: "100%",
        fontWeight: "bold",
        fontSize: "16px",
        cursor: estaCargando || esExitoso ? "not-allowed" : "pointer",
        transition: "background-color 0.3s ease",
      }}
    >
      {esExitoso ? textoExitoso : estaCargando ? textoCargando : texto}
    </button>
  );
};