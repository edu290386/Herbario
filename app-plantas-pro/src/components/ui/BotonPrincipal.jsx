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
  // Verde suave profesional (estilo Herbario)
  const verdeSuave = colores.frondoso;
  const verdeOscuro = colores.encendido;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={estaCargando || esExitoso}
      style={{
        backgroundColor: estaCargando || esExitoso ? verdeOscuro : verdeSuave,
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