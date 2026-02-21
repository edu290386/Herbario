import { useState } from "react";
import { PiPlantFill, PiMapPinFill, PiBookOpenTextFill } from "react-icons/pi";
import { GiAfrica, GiEarthAmerica } from "react-icons/gi";
import { FaBookReader, FaChevronCircleDown } from "react-icons/fa";

export const GuiaRegistro = ({ flujo }) => {
  const [abierto, setAbierto] = useState(false); // Empieza cerrado

  const configuracion = {
    "nueva planta": {
      bg: "#fdfdfd",
      border: "var(--color-frondoso)",
      icon: <FaBookReader size={25} color="var(--color-frondoso)" />,
      titulo: "Registro de Planta",
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
      border: "#339af0", // Azul informativo
      icon: <FaBookReader size={25} color="#339af0" />,
      titulo: "Captura de Ubicación",
      pasos: [
        <>
          <strong>Requisitos Técnicos:</strong> Es obligatorio permitir el
          acceso al <strong>GPS</strong>. Asegúrate de que los indicadores de
          Foto y GPS se marquen en verde para finalizar.
        </>,
        <>
          <strong>Foto de Referencia:</strong> No tomes solo la planta; incluye
          objetos cercanos (banca, reja o casa) que sirvan de{" "}
          <strong>punto de referencia</strong> para que otros la encuentren.
        </>,

        /* 2. REGLAS DE CAMPO (Evita errores de registro) */
        <>
          <strong>Regla de Proximidad:</strong> No puedes registrar la{" "}
          <strong>misma planta</strong> a menos de 40 metros de su punto
          anterior. Entre 40 y 100 metros, el sistema te avisará para que
          decidas si es un nuevo ejemplar.
        </>,
        <>
          <strong>Biodiversidad:</strong> Si en el mismo punto hay una{" "}
          <strong>especie diferente</strong>, puedes registrarla sin ninguna
          restricción de distancia.
        </>,

        /* 3. PRIVACIDAD Y GRUPO (Confianza y colaboración) */
        <>
          <strong>Privacidad Grupal:</strong> Tu ubicación es privada y{" "}
          <strong>recíproca</strong>: solo la compartes con tu grupo, y a
          cambio, tú ves los puntos que ellos registren.
        </>,
        <>
          <strong>Valor del Mapeo:</strong> Más ubicaciones significan un mapa
          más fuerte para <strong>identificar zonas de crecimiento</strong> y
          localizar ejemplares eficientemente.
        </>,

        /* 4. SOPORTE (Plan B) */
        <>
          <strong>¿Sin señal?:</strong> Si el GPS falla, toma una captura de la
          ubicación y la foto, y <strong>envíalas al administrador</strong> para
          un registro manual.
        </>,
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
    <div className={`guia-container-new ${abierto ? "guia-abierta" : ""}`}>
      <div
        className="guia-header-new"
        onClick={() => setAbierto(!abierto)}
        style={{ cursor: "pointer" }}
      >
        <div className="guia-titulo-wrapper">
          {info.icon}
          <span className="guia-titulo-new">{info.titulo}</span>
        </div>

        {/* Alineación horizontal: Icono y Texto al costado */}
        <div className={`guia-toggle-box ${abierto ? "abierto" : ""}`}>
          <span className="guia-toggle-text">
            {abierto ? "CERRAR" : "Orientación"}
          </span>
          <FaChevronCircleDown
            className="guia-icon-anim"
            size={18}
            color="#339af0"
          />
        </div>
      </div>

      {abierto && (
        <ul className="guia-lista-new animation-fadeIn">
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
      )}
    </div>
  );
};