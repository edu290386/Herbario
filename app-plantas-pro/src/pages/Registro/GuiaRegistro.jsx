import { PiPlantFill, PiMapPinFill, PiBookOpenTextFill } from "react-icons/pi";
import { GiAfrica, GiEarthAmerica } from "react-icons/gi";

export const GuiaRegistro = ({ flujo }) => {
  const configuracion = {
    "nueva planta": {
      bg: "#fdfdfd",
      border: "var(--color-frondoso)",
      icon: <PiBookOpenTextFill size={26} color="var(--color-frondoso)" />,
      titulo: "Instrucciones de Registro",
      pasos: [
        <>
          <strong>Nombres locales:</strong> Si en tu país se llama{" "}
          <strong>Aguacate (MX)</strong> o <strong>Palta (PE)</strong>,
          escríbelo y selecciona su país respectivo.
        </>,
        <>
          <strong>Sin fronteras:</strong> Si no sabes el país exacto o es un
          nombre universal, usa{" "}
          <span style={{ color: "var(--color-frondoso)", fontWeight: "700" }}>
            <GiEarthAmerica /> Internacional
          </span>
          . No hay problema si desconoces ese dato.
        </>,
        <>
          <strong>Sabiduría Sagrada:</strong> Para nombres religiosos o sagrados
          como <em style={{ color: "#856404" }}>Ewé Atori</em> (Yoruba),
          selecciona{" "}
          <span style={{ color: "#856404", fontWeight: "700" }}>
            <GiAfrica /> Nombre Sagrado
          </span>
          .
        </>,
        <>
          <strong>Ejemplos rápidos:</strong>{" "}
          <em style={{ opacity: 0.8 }}>Cayena (VE)</em>,{" "}
          <em style={{ opacity: 0.8 }}>Cucarda (PE)</em>.
        </>,
        <>
          <strong>Sistema Inteligente:</strong> No permitimos duplicados. Si el
          sistema bloquea tu registro y crees que es un error,{" "}
          <strong>contacta al administrador</strong> para evaluar tu caso.
        </>,
      ],
    },
    "solo ubicacion": {
      bg: "#fdfdfd",
      border: "#339af0",
      icon: <PiMapPinFill size={26} color="#339af0" />,
      titulo: "Captura de Ubicación",
      pasos: [
        "Toca la cámara para registrar la planta en su entorno real.",
        "Asegúrate de que los indicadores de Foto y GPS estén en verde.",
        "Espera unos segundos para que la dirección sea precisa.",
      ],
    },
    "agregar detalle": {
      bg: "#fdfdfd",
      border: "#845ef7",
      icon: <PiPlantFill size={26} color="#845ef7" />,
      titulo: "Mejorar Información",
      pasos: [
        "Añade variantes de nombres y fotos de alta calidad.",
        "Tu contribución ayuda a la comunidad a identificar mejor esta especie.",
      ],
    },
  };

  const info = configuracion[flujo];
  if (!info) return null;

  return (
    <div className="guia-container-new">
      <div
        className="guia-header-new"
        style={{ borderBottomColor: info.border }}
      >
        {info.icon}
        <span className="guia-titulo-new">{info.titulo}</span>
      </div>
      <ul className="guia-lista-new">
        {info.pasos.map((paso, index) => (
          <li key={index} className="guia-item-new">
            <div
              className="guia-bullet"
              style={{ backgroundColor: info.border }}
            />
            <div className="guia-texto-paso">{paso}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
